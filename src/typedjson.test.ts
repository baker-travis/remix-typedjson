import { deserialize, serialize, stringify } from './typedjson'

describe('serialize and deserialize', () => {
  it('works for objects', () => {
    const obj = { 1: 5, 2: { 3: 'c' } }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toBeUndefined()
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for nested arrays', () => {
    const obj = { data: [{ greeting: 'hello', today: new Date() }], counter: 1 }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toEqual([{ path: ['data', '0', 'today'], type: 'date' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('special case: objects with array-like keys', () => {
    const obj = { 0: 3, 1: 5, 2: { 3: 'c' } }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toBeUndefined()
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for arrays', () => {
    const obj = [1, undefined, 2]
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toEqual([{ path: ['1'], type: 'undefined' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for sets with serializable values', () => {
    const obj = {
      a: new Set([1, 2, 3]),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":[1,2,3]}')
    expect(meta).toEqual([{ path: ['a'], type: 'set' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it.skip('works for sets with non-serializable values', () => {
    const obj = {
      a: new Set([1, undefined, 2, new Date(Date.UTC(2020, 0, 1))]),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":[1,null,2,"2020-01-01T00:00:00.000Z"]}')
    expect(meta).toEqual({ a: 'set', 'a.1': 'undefined', 'a.3': 'date' })
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it.skip('works for top-level Sets', () => {
    const obj = new Set([1, undefined, 2])

    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for simple Maps', () => {
    const obj = {
      a: new Map([
        ['key', 'value'],
        ['anotherkey', 'b'],
      ]),
      b: new Map([['2', 'b']]),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(
      JSON.stringify({ a: { key: 'value', anotherkey: 'b' }, b: { '2': 'b' } }),
    )
    expect(meta).toEqual([
      { path: ['a'], type: 'map' },
      { path: ['b'], type: 'map' },
    ])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it.skip('works for complex Maps', () => {
    const obj = {
      a: new Map([
        [1, 'a'],
        [NaN, 'b'],
      ]),
      b: new Map([['2', 'b']]),
      d: new Map([[true, 'true key']]),
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it.skip('works for paths containing dots', () => {
    const obj = {
      'a.1': {
        b: new Set([1, 2]),
      },
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it.skip('works for paths containing backslashes', () => {
    const obj = {
      'a\\.1': {
        b: new Set([1, 2]),
      },
    }
    const { json, meta } = serialize(obj)
    //console.log(json, meta)
    const result = deserialize({ json, meta })
    //console.log(result)
    expect(result).toEqual(obj)
  })
  it('works for Dates', () => {
    const obj = {
      meeting: {
        date: new Date(2020, 1, 1),
      },
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(JSON.stringify(obj))
    expect(meta).toEqual([{ path: ['meeting', 'date'], type: 'date' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for Errors', () => {
    const obj = {
      e: new Error('epic fail'),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual(
      JSON.stringify({
        e: { name: 'Error', message: 'epic fail', stack: obj.e.stack },
      }),
    )
    expect(meta).toEqual([{ path: ['e'], type: 'error' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for regex', () => {
    const obj = { a: /hello/g }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"/hello/g"}')
    expect(meta).toEqual([{ path: ['a'], type: 'regexp' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for Infinity', () => {
    const obj = {
      a: Number.POSITIVE_INFINITY,
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"Infinity"}')
    expect(meta).toEqual([{ path: ['a'], type: 'infinity' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for -Infinity', () => {
    const obj = {
      a: Number.NEGATIVE_INFINITY,
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"-Infinity"}')
    expect(meta).toEqual([{ path: ['a'], type: '-infinity' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for NaN', () => {
    const obj = { a: NaN }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"NaN"}')
    expect(meta).toEqual([{ path: ['a'], type: 'nan' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for BigInt', () => {
    const obj = {
      a: BigInt('1021312312412312312313'),
    }
    const { json, meta } = serialize(obj)
    expect(json).toEqual('{"a":"1021312312412312312313"}')
    expect(meta).toEqual([{ path: ['a'], type: 'bigint' }])
    const result = deserialize<typeof obj>({ json, meta })
    expect(result).toEqual(obj)
  })
  it('works for undefined', () => {
    expect(deserialize(serialize(undefined)!)).toBeUndefined()
  })

  it('works for serialize output arguments', () => {
    const test = {
      bi: BigInt('1021312312412312312313'),
      nan: NaN,
      inf: {
        P: Number.POSITIVE_INFINITY,
        N: Number.NEGATIVE_INFINITY,
      },
      d: new Date(Date.UTC(1979, 0, 10)),
    }

    const strStd = stringify(test)
    const strDbg = stringify(test, null, 2)

    expect(strStd).toBe(
      '{"json":"{\\"bi\\":\\"1021312312412312312313\\",\\"nan\\":\\"NaN\\",\\"inf\\":{\\"P\\":\\"Infinity\\",\\"N\\":\\"-Infinity\\"},\\"d\\":\\"1979-01-10T00:00:00.000Z\\"}","meta":[{"path":["bi"],"type":"bigint"},{"path":["nan"],"type":"nan"},{"path":["inf","P"],"type":"infinity"},{"path":["inf","N"],"type":"-infinity"},{"path":["d"],"type":"date"}]}',
    )
    expect(strDbg).toBe(`{
  "json": {
    "bi": "1021312312412312312313",
    "nan": "NaN",
    "inf": {
      "P": "Infinity",
      "N": "-Infinity"
    },
    "d": "1979-01-10T00:00:00.000Z"
  },
  "meta": [
    {
      "path": [
        "bi"
      ],
      "type": "bigint"
    },
    {
      "path": [
        "nan"
      ],
      "type": "nan"
    },
    {
      "path": [
        "inf",
        "P"
      ],
      "type": "infinity"
    },
    {
      "path": [
        "inf",
        "N"
      ],
      "type": "-infinity"
    },
    {
      "path": [
        "d"
      ],
      "type": "date"
    }
  ]
}`)
  })
})

it('works for clashing dot notation keys', () => {
  const obj = { a: {}, 'a.b': NaN }
  const { json, meta } = serialize(obj)
  expect(json).toEqual('{"a":{},"a.b":"NaN"}')
  expect(meta).toEqual([{ path: ['a.b'], type: 'nan' }])
  const result = deserialize<typeof obj>({ json, meta })
  expect(result).toEqual(obj)
})
