"use client"

import { useState, useRef } from "react"

export default function VapiWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const vapiRef = useRef<any>(null)

  const startCall = async () => {
    const { default: Vapi } = await import('@vapi-ai/web')
    vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!)
    await vapiRef.current.start({
      assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!,
    })
    setIsConnected(true)
  }

  const endCall = () => {
    vapiRef.current?.stop()
    setIsConnected(false)
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-gray-800 transition z-50"
      >
        💬
      </button>
      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl p-6 w-72 z-50">
          <h3 className="text-lg font-bold mb-2">Talk with Momoyo</h3>
          {!isConnected ? (
            <button onClick={startCall} className="w-full bg-black text-white py-2 rounded-full">
              通話開始
            </button>
          ) : (
            <button onClick={endCall} className="w-full bg-red-500 text-white py-2 rounded-full">
              終了
            </button>
          )}
          <button onClick={() => setIsOpen(false)} className="mt-2 w-full border py-2 rounded-full">
            閉じる
          </button>
        </div>
      )}
    </>
  )
}