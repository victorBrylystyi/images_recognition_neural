/* eslint-disable no-restricted-globals */
import { likely, NeuralNetwork } from 'brain.js'
import { useCallback, useEffect, useMemo, useRef, useState } from "react"


const SmartCanvas = (props) => {

    const { backgroundColor, width, height } = props

    const canvasRef = useRef()
    const [ctx, setCtx] = useState(null)
    const [isPaint, setIsPaint] = useState(false) 
    const [pixel] = useState(20)
    const [net] = useState(new NeuralNetwork())
    
    const train_data = useMemo(() => [], [])

    const down = useCallback(e => {

        setIsPaint(true)
        ctx.beginPath()

    }, [ctx, setIsPaint])

    const move = useCallback(e => {

        if( isPaint ){

          ctx.fillStyle = 'red'
          ctx.strokeStyle = 'red'
          ctx.lineWidth = pixel

          ctx.lineTo(e.offsetX * window.devicePixelRatio, e.offsetY * window.devicePixelRatio)
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(e.offsetX * window.devicePixelRatio, e.offsetY * window.devicePixelRatio, pixel / 2, 0, Math.PI * 2)
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(e.offsetX * window.devicePixelRatio, e.offsetY * window.devicePixelRatio)

        }

    }, [ctx, isPaint, pixel])

    const up = useCallback(e => setIsPaint(false), [setIsPaint])

    const out = useCallback(e => setIsPaint(false), [setIsPaint])

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

    const clear = useCallback(() => ctx.clearRect(0, 0, width* window.devicePixelRatio, height* window.devicePixelRatio), [ctx, width, height])

    const drawGrid = useCallback(() => {
        const w = width * window.devicePixelRatio
        const h = height * window.devicePixelRatio
        const p = w / pixel

        const xStep = w / p
        const yStep = h / p

        for( let x = 0; x < w; x += xStep ){
          drawLine(x, 0, x, h)
        }

        for( let y = 0; y < h; y += yStep ){
          drawLine(0, y, w, y)
        }


    }, [pixel, width, height, drawLine])

    const calculate = useCallback((draw = false) => {

        const w = width * window.devicePixelRatio
        const h = height * window.devicePixelRatio
        const p = w / pixel

        const xStep = w / p
        const yStep = h / p

        const vector = []
        let __draw = []

        for( let x = 0; x < w; x += xStep ){

            for( let y = 0; y < h; y += yStep ){

                const data = ctx.getImageData(x, y, xStep, yStep, {})

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

    }, [ctx, pixel, width, height, drawCell, clear, drawGrid])

    const keyHandler = useCallback(e => {

      let vector = []

      if( e.key.toLowerCase() === 'c')  clear()
      
      if( e.key.toLowerCase() === 's' ){

        vector = calculate(true)
        
        //train
        if( confirm('Positive?') ){

          train_data.push({
            input: vector,
            output: {positive: 1}
          })

        } else {

          train_data.push({
            input: vector,
            output: {negative: 1}
          })

        }

        console.log('trainData', train_data)
      }


      if( e.key.toLowerCase() === 't' ){

        console.log('train')

        net.train(train_data, {log: true, iterations:2000 })
        // setNet(new NeuralNetwork())
      }

      if( e.key.toLowerCase() === 'e' ){

          const result = likely(calculate(), net)

          alert(result)
          console.log(result)
      }

    }, [calculate, clear, net, train_data])

    // useEffect(() => {
    //   // net
    //   // .trainAsync(train_data, {log: true,})
    //   // .then((res) => {
    //   //   console.log(res)
    //   // })

    //   if (net) {
    //     net.train(train_data, {log: true})
    //     // document.querySelector('#result').innerHTML = utilities.toSVG(
    //     //   net.toJSON(),
    //     //   {
    //     //     height: 500,
    //     //     width: 500,
    //     //     radius: 10,
    //     //     line: {
    //     //       width: 1,
    //     //       color: 'yellow',
    //     //     },
    //     //     inputs: {
    //     //       color: 'green',
    //     //       // labels: ,
    //     //     },
    //     //     hidden: {
    //     //       color: 'blue',
    //     //     },
    //     //     outputs: {
    //     //       color: 'red',
    //     //     },
    //     //     recurrentLine: {
    //     //       color: 'orange',
    //     //     },
    //     //     fontSize: 2,
    //     //   }
    //     // )
    //   } 



    // }, [net, train_data])

    useEffect(() => {

      const canvas = canvasRef.current

        canvas.addEventListener('pointerdown', down)
        canvas.addEventListener('pointermove', move)
        canvas.addEventListener('pointerup', up)
        canvas.addEventListener('pointerout', out)
        document.addEventListener('keypress', keyHandler)
      

      return () => {
            canvas.removeEventListener('pointerdown', down)
            canvas.removeEventListener('pointermove', move)
            canvas.removeEventListener('pointerup', up)
            canvas.removeEventListener('pointerout', out)
            document.removeEventListener('keypress', keyHandler)
        }
    

    }, [down, move, up, out, keyHandler])


    useEffect(() => {

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        setCtx(ctx)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <canvas 
            ref={canvasRef} 
            id="canv"
            width={width * (window.devicePixelRatio || 1)}
            height={height * (window.devicePixelRatio || 1)}
            style={{
                backgroundColor,
                width,
                height
            }}
        > 
            Upps... 
        </canvas>
    )

}

export default SmartCanvas