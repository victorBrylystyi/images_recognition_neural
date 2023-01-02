import { useCallback, useEffect, useState } from "react"


const useDrawTools = ({ context }) => {

    // console.log('useDrawTools', context)
    const pixel = 20
    const canvaWidth = 500
    const canvaHeight = 500

    const [ctx, setCtx] = useState(context)

    useEffect(() => {
        setCtx(context)
    }, [context])

    const drawLine = useCallback((x1, y1, x2, y2, color = 'gray', lineWidth = 1) => {

        ctx.beginPath()

        ctx.strokeStyle = color
        ctx.lineJoin = 'miter'
        ctx.lineWidth = lineWidth

        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)

        ctx.stroke()

    }, [ctx])

    const drawCell = useCallback((x, y, w, h, lineWidth = 1, color = 'blue' ) => {

        ctx.fillStyle = color
        ctx.strokeStyle = color
        ctx.lineJoin = 'miter'
        ctx.lineWidth = lineWidth

        ctx.rect(x, y, w, h)
        ctx.fill()

    }, [ctx])

    const clear = useCallback(() => ctx.clearRect(0, 0, canvaWidth, canvaHeight), [ctx, canvaWidth, canvaHeight])

    const drawGrid = useCallback(() => {
        const w = canvaWidth
        const h = canvaHeight
        const p = w / pixel

        const xStep = w / p
        const yStep = h / p

        for( let x = 0; x < w; x += xStep ){
          drawLine(x, 0, x, h)
        }

        for( let y = 0; y < h; y += yStep ){
          drawLine(0, y, w, y)
        }


    }, [pixel, canvaWidth, canvaHeight, drawLine])

    const calculate = useCallback((draw = false) => {

        const w = canvaWidth
        const h = canvaHeight
        const p = w / pixel

        const xStep = w / p
        const yStep = h / p

        const vector = []
        let __draw = []

        for( let x = 0; x < w; x += xStep ){

            for( let y = 0; y < h; y += yStep ){

                console.log(ctx)
                const data = ctx.getImageData(x, y, xStep, yStep)

                let nonEmptyPixelsCount = 0

                for( let i = 0; i < data.data.length; i += 10 ){

                    const isEmpty = data.data[i] === 0

                    if( !isEmpty ){
                        nonEmptyPixelsCount += 1
                    }

                }

                if( nonEmptyPixelsCount > 1 && draw ){
                    __draw.push([x, y, xStep, yStep])
                }

                vector.push(nonEmptyPixelsCount > 1 ? 1 : 0)

            }

        }

        if( draw ){

            clear()
            drawGrid()

            for( const _d in __draw ){
                drawCell( __draw[_d][0], __draw[_d][1], __draw[_d][2], __draw[_d][3] );
            }
        }

        return vector

    }, [ctx, pixel, canvaWidth, canvaHeight, drawCell, clear, drawGrid])


    return {
        drawLine,
        drawCell,
        clear,
        drawGrid,
        calculate
    }

}

export default useDrawTools