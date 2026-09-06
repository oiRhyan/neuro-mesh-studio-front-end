'use client'
import { useThree } from "@react-three/fiber"
import { useEffect } from "react"

function ThumbnailCapture({
    onCaptureReady
}: {
    onCaptureReady: (
        capture: () => string
    ) => void
}) {
    const { gl } = useThree()
    useEffect(() => {
        onCaptureReady(() => {
            return gl.domElement.toDataURL(
                'image/png'
            )
        })
    }, [
        gl,
        onCaptureReady
    ])

    return null
}