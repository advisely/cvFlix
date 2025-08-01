
'use client'

import { useState, ReactElement, ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  button: ReactElement
}

export const Modal = ({ children, button }: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {button}
      </div>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-2xl bg-[#141414] rounded-lg shadow-lg border border-[#303030]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {children}
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-2 right-2 bg-[#e50914] hover:bg-[#f40612] text-white font-bold py-1 px-2 rounded-full text-xs"
            >
              X
            </button>
          </div>
        </div>
      )}
    </>
  )
}
