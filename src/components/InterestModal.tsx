'use client'

import { useState } from 'react'

interface InterestModalProps {
  triggers: string[]
  onSubmit?: (message: string, contactInfo: string) => void
  buttonText?: string
  buttonClassName?: string
  iconStart?: React.ReactNode
}

export default function InterestModal({ 
  triggers,
  onSubmit,
  buttonText = "Kontakt sælger",
  buttonClassName = "w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90",
  iconStart
}: InterestModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  const handleTriggerClick = (trigger: string) => {
    setSelectedTrigger(trigger)
    setIsOpen(true)
  }

  const handleOpenModal = () => {
    setIsOpen(true);
    setSelectedTrigger("Jeg er interesseret i dette produkt");
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const message = selectedTrigger === 'Andre spørgsmål' 
      ? customMessage 
      : selectedTrigger || ''
      
    if (onSubmit) {
      onSubmit(message, contactInfo)
    }
    
    // Reset form
    setIsOpen(false)
    setSelectedTrigger(null)
    setCustomMessage('')
    setContactInfo('')
  }

  return (
    <div>
      {/* Hovedknap */}
      <button 
        type="button"
        onClick={handleOpenModal}
        className={buttonClassName}
      >
        {iconStart}
        {buttonText}
      </button>
      
      {/* Specifik Triggers Menu - hvis der er triggers */}
      {triggers.length > 0 && (
        <div className="mt-2 space-y-2">
          {triggers.map((trigger) => (
            <button
              key={trigger}
              onClick={() => handleTriggerClick(trigger)}
              className="w-full text-left text-sm text-gray-600 hover:text-primary py-1 px-2 rounded hover:bg-gray-100"
            >
              {trigger}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Vis interesse</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Din besked
                  </label>
                  {selectedTrigger === 'Andre spørgsmål' ? (
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-100 rounded-md">
                      {selectedTrigger}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dine kontaktoplysninger
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Email eller telefonnummer"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuller
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1AA49A] text-white rounded-md hover:bg-[#158f86]"
                  >
                    Send besked
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 