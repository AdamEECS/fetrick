class GuaCanvas extends GuaObject {
    constructor(selector) {
        super()
        this.setup(selector)
    }
    setup(selector) {
        let canvas = _e(selector)
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.w = canvas.width
        this.h = canvas.height
        this.pixels = this.context.getImageData(0, 0, this.w, this.h)
        this.bytesPerPixel = 4
        // this.pixelBuffer = this.pixels.data
        this.penDown = false
        this.penType = null
        this.penSize = 1
        this.penColor = GuaColor.black()
        this.start = null
        this.end = null
        this.btns = []
        this.currentBtn = {}
        this.setupEvents()
        this.setupInput()
    }
    setupEvents() {
        let s = this
        s.penEvent = {
            'line': function() {
                s.drawLine(s.start, s.end, s.penColor)
            },
            'rect': function() {
                s.drawRectByVertex(s.start, s.end, null, s.penColor, s.penSize)
            },
            'pencil': function() {
                // s.drawPoint(s.end)
                s.drawLine(s.start, s.end, s.penColor)
            },
            'button': function() {
                s.drawRectByVertex(s.start, s.end, null, s.penColor, s.penSize)

            },
            'touch': function() {
                let {x, y} = s.start
                for (let btn of s.btns) {
                    if (x > btn.start.x && x < btn.end.x && y > btn.start.y && y < btn.end.y) {
                        let w = btn.end.x - btn.start.x - 2
                        let h = btn.end.y - btn.start.y - 2
                        let btnX = btn.start.x + 1
                        let btnY = btn.start.y + 1
                        s.currentBtn = {btnX, btnY, w, h}
                        s.fillRect(btnX, btnY, w, h, GuaColor.red())
                        s.render()
                    }
                }
            },
            'touchClear': function() {
                let {btnX, btnY, w, h} = s.currentBtn
                s.fillRect(btnX, btnY, w, h, GuaColor.white())
                s.render()
            },
        }
    }
    setupInput() {
        // mouse event
        let s = this

        s.canvas.addEventListener('mousedown', function(event) {
            var x = event.offsetX
            var y = event.offsetY
            s.penDown = true
            s.start = GuaPoint.new(x, y)
            s.save()
            if (s.penType == 'touch') {
                log(s.btns)
                s.penEvent['touch']()
            }
        })
        s.canvas.addEventListener('mousemove', function(event) {
            var x = event.offsetX
            var y = event.offsetY

            if (s.penDown) {
                if (s.penType != 'pencil') {
                    s.restore()
                }

                s.end = GuaPoint.new(x, y)
                if (s.penType in s.penEvent) {
                    s.penEvent[s.penType]()
                }

                if (s.penType == 'pencil') {
                    s.start = s.end
                }
                s.render()
            }
        })
        s.canvas.addEventListener('mouseup', function(event) {
            if (s.penType == 'button') {
                let btn = {start: s.start, end: s.end}
                s.btns.push(btn)
            }
            s.penDown = false
            s.start = null
            s.end = null

            if (s.penType == 'touch') {
                s.penEvent['touchClear']()
            }
        })
    }
    save() {
        this.dataCopy = new Uint8ClampedArray(this.pixels.data);
    }
    restore() {
        this.pixels.data.set(this.dataCopy)
    }
    render() {
        // 执行这个函数后, 才会实际地把图像画出来
        // ES6 新语法, 取出想要的属性并赋值给变量, 不懂自己搜「ES6 新语法」
        let {pixels, context} = this
        context.putImageData(pixels, 0, 0)
    }
    clear(color=GuaColor.white()) {
        // color GuaColor
        // 用 color 填充整个 canvas
        // 遍历每个像素点, 设置像素点的颜色
        let {w, h} = this
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                this._setPixel(x, y, color)
            }
        }
        this.render()
    }
    _setPixel(x, y, color) {
        // color: GuaColor
        // 这个函数用来设置像素点, _ 开头表示这是一个内部函数, 这是我们的约定
        // 浮点转 int
        let int = Math.floor
        x = int(x)
        y = int(y)
        // 用座标算像素下标
        let i = (y * this.w + x) * this.bytesPerPixel
        // 设置像素
        let p = this.pixels.data
        let {r, g, b, a} = color
        // 一个像素 4 字节, 分别表示 r g b a
        p[i] = r
        p[i+1] = g
        p[i+2] = b
        p[i+3] = a
    }
    drawPoint(point, color=GuaColor.black()) {
        // point: GuaPoint
        let {w, h} = this
        let p = point
        if (p.x >= 0 && p.x <= w) {
            if (p.y >= 0 && p.y <= h) {
                this._setPixel(p.x, p.y, color)
            }
        }
    }
    drawLine(p1, p2, color=GuaColor.black()) {
        // p1 p2 分别是起点和终点, GuaPoint 类型
        // color GuaColor
        // 使用 drawPoint 函数来画线
        let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y]
        let dx = x2 - x1
        let dy = y2 - y1

        if(Math.abs(dx) > Math.abs(dy)) {
            let ratio = dx == 0 ? 0 : dy / dx
            for(let x = x1; x !== x2; x += dx / Math.abs(dx)) {
                let y = y1 + (x - x1) * ratio
                this.drawPoint(GuaPoint.new(x, y), color)
            }
        } else {
            let ratio = dy == 0 ? 0 : dx / dy
            for(let y = y1; y !== y2; y += dy / Math.abs(dy)) {
                let x = x1 + (y - y1) * ratio
                this.drawPoint(GuaPoint.new(x, y), color)
            }
        }
    }
    drawRectByVertex(start, end, fillColor=null, borderColor=GuaColor.black(), borderWidth=1) {
        let {x: x1, y: y1} = start
        let {x: x2, y: y2} = end
        let minX = Math.min(x1, x2)
        let minY = Math.min(y1, y2)
        let size = new GuaSize(Math.abs(x2 - x1), Math.abs(y2 - y1))
        let upperLeft = new GuaPoint(minX, minY)
        this.drawRect(upperLeft, size, fillColor, borderColor, borderWidth)
    }
    drawRect(upperLeft, size, fillColor=null, borderColor=GuaColor.black(), borderWidth=1) {
        // upperLeft: GuaPoint, 矩形左上角座标
        // size: GuaSize, 矩形尺寸
        // fillColor: GuaColor, 矩形的填充颜色, 默认为空, 表示不填充
        // borderColor: GuaColor, 矩形的的边框颜色, 默认伪黑色
        let {x, y} = upperLeft
        let {w, h} = size
        // 绘制填充
        if (fillColor !== null) {
            this.fillRect(x, y, w, h, fillColor)
        }
        // 绘制轮廓
        this.strokeRect(x, y, w, h, borderColor, borderWidth)

    }
    strokeRect(x, y, w, h, borderColor=GuaColor.black(), borderWidth=1) {
        for (var i = 0; i < borderWidth; i++) {
            // 计算四个顶点
            let upperLeft = GuaPoint.new(x + i, y + i)
            let upperRight = GuaPoint.new(x + w - i, y + i)
            let lowerLeft = GuaPoint.new(x + i, y + h - i)
            let lowerRight = GuaPoint.new(x + w - i, y + h - i)
            // 按照 上 右 下 左 的顺序绘制四条边
            this.drawLine(upperLeft, upperRight, borderColor)
            this.drawLine(upperRight, lowerRight, borderColor)
            this.drawLine(lowerRight, lowerLeft, borderColor)
            this.drawLine(lowerLeft, upperLeft, borderColor)
        }
    }
    fillRect(x, y, w, h, color=GuaColor.white()) {
        for (let x0 = x; x0 <= x + w; x0++) {
            for (let y0 = y; y0 <= y + h; y0++) {
                this.drawPoint(GuaPoint.new(x0, y0), color)
            }
        }
    }
    __debug_draw_demo() {
        // 这是一个 demo 函数, 用来给你看看如何设置像素
        // ES6 新语法, 取出想要的属性并赋值给变量, 不懂自己搜「ES6 新语法」
        let {context, pixels} = this
        // 获取像素数据, data 是一个数组
        let data = pixels.data
        // 一个像素 4 字节, 分别表示 r g b a
        for (let i = 0; i < data.length; i += 4) {
            let [r, g, b, a] = data.slice(i, i + 4)
            r = 255
            a = 255
            data[i] = r
            data[i+3] = a
        }
        context.putImageData(pixels, 0, 0)
    }
}
