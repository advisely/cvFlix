
'use client'

import { useState } from 'react'

export const Modal = ({ children, buttonText }: { children: React.ReactNode, buttonText: string }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>{buttonText}</button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-lg">
            {children}
            <button onClick={() => setIsOpen(false)} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
