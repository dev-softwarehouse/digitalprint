const pick=require('./tools').pick

const expect = require('chai').expect

describe('tools tests', () => {
    it('pick', () => {
        const source = {a: 1, b: null}
        const r1 = pick('a b c', source)
        expect(r1).to.deep.equal( {a: 1})
    })
})