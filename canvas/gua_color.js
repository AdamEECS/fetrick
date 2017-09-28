class GuaColor extends GuaObject {
    // 表示颜色的类
    constructor(r, g, b, a) {
        super()
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
    // 常见的几个颜色
    static black() {
        return this.new(0, 0, 0, 255)
    }
    static white() {
        return this.new(255, 255, 255, 255)
    }
    static red() {
        return this.new(255, 0, 0, 255)
    }
    static create(hex) {
        let r = hex.slice(1, 3)
        let g = hex.slice(3, 5)
        let b = hex.slice(5)
        r = parseInt(r, 16)
        g = parseInt(g, 16)
        b = parseInt(b, 16)
        return this.new(r, g, b, 255)
    }
}
