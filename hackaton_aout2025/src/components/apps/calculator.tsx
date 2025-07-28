import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Calculator() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForNewValue, setWaitingForNewValue] = useState(false)

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num)
      setWaitingForNewValue(false)
    } else {
      setDisplay(display === "0" ? num : display + num)
    }
  }

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.")
      setWaitingForNewValue(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForNewValue(false)
  }

  const performCalculation = () => {
    const current = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(current)
    } else if (operation) {
      const prev = previousValue || 0
      let result: number

      switch (operation) {
        case "+":
          result = prev + current
          break
        case "-":
          result = prev - current
          break
        case "×":
          result = prev * current
          break
        case "÷":
          result = current !== 0 ? prev / current : 0
          break
        default:
          return
      }

      // Limiter le nombre de décimales pour éviter les erreurs de floating point
      const formattedResult = parseFloat(result.toPrecision(12))
      setDisplay(String(formattedResult))
      setPreviousValue(formattedResult)
    }
  }

  const handleOperation = (nextOperation: string) => {
    if (previousValue === null) {
      setPreviousValue(parseFloat(display))
    } else if (operation) {
      performCalculation()
    }

    setWaitingForNewValue(true)
    setOperation(nextOperation)
  }

  const calculate = () => {
    if (operation && previousValue !== null) {
      performCalculation()
      setOperation(null)
      setPreviousValue(null)
      setWaitingForNewValue(true)
    }
  }

  const percentage = () => {
    const current = parseFloat(display)
    setDisplay(String(current / 100))
  }

  const toggleSign = () => {
    if (display !== "0") {
      setDisplay(display.charAt(0) === "-" ? display.slice(1) : "-" + display)
    }
  }

  const buttonClass = "h-12 text-lg font-semibold transition-all duration-150 active:scale-95"
  const numberButtonClass = `${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`
  const operatorButtonClass = `${buttonClass} bg-orange-500 hover:bg-orange-400 text-white`
  const functionButtonClass = `${buttonClass} bg-gray-500 hover:bg-gray-400 text-white`

  return (
    <div className="flex flex-col h-full bg-black text-white p-4">
      {/* Écran */}
      <div className="mb-4 p-4 bg-black rounded-lg border border-gray-700">
        <div className="text-right">
          {/* Opération en cours */}
          {previousValue !== null && operation && (
            <div className="text-sm text-gray-400 mb-1">
              {previousValue} {operation}
            </div>
          )}
          {/* Affichage principal */}
          <div 
            className="text-3xl font-light text-white min-h-[1.2em] break-all"
            style={{ fontSize: display.length > 10 ? "1.5rem" : "2rem" }}
          >
            {display}
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {/* Ligne 1 */}
        <Button 
          onClick={clear} 
          className={functionButtonClass}
          title="Tout effacer (All Clear)"
        >
          AC
        </Button>
        <Button 
          onClick={toggleSign} 
          className={functionButtonClass}
          title="Changer le signe (+/-)"
        >
          ±
        </Button>
        <Button 
          onClick={percentage} 
          className={functionButtonClass}
          title="Calculer le pourcentage"
        >
          %
        </Button>
        <Button 
          onClick={() => handleOperation("÷")} 
          className={operatorButtonClass}
          title="Division"
        >
          ÷
        </Button>

        {/* Ligne 2 */}
        <Button 
          onClick={() => inputNumber("7")} 
          className={numberButtonClass}
          title="Saisir le chiffre 7"
        >
          7
        </Button>
        <Button 
          onClick={() => inputNumber("8")} 
          className={numberButtonClass}
          title="Saisir le chiffre 8"
        >
          8
        </Button>
        <Button 
          onClick={() => inputNumber("9")} 
          className={numberButtonClass}
          title="Saisir le chiffre 9"
        >
          9
        </Button>
        <Button 
          onClick={() => handleOperation("×")} 
          className={operatorButtonClass}
          title="Multiplication"
        >
          ×
        </Button>

        {/* Ligne 3 */}
        <Button 
          onClick={() => inputNumber("4")} 
          className={numberButtonClass}
          title="Saisir le chiffre 4"
        >
          4
        </Button>
        <Button 
          onClick={() => inputNumber("5")} 
          className={numberButtonClass}
          title="Saisir le chiffre 5"
        >
          5
        </Button>
        <Button 
          onClick={() => inputNumber("6")} 
          className={numberButtonClass}
          title="Saisir le chiffre 6"
        >
          6
        </Button>
        <Button 
          onClick={() => handleOperation("-")} 
          className={operatorButtonClass}
          title="Soustraction"
        >
          −
        </Button>

        {/* Ligne 4 */}
        <Button 
          onClick={() => inputNumber("1")} 
          className={numberButtonClass}
          title="Saisir le chiffre 1"
        >
          1
        </Button>
        <Button 
          onClick={() => inputNumber("2")} 
          className={numberButtonClass}
          title="Saisir le chiffre 2"
        >
          2
        </Button>
        <Button 
          onClick={() => inputNumber("3")} 
          className={numberButtonClass}
          title="Saisir le chiffre 3"
        >
          3
        </Button>
        <Button 
          onClick={() => handleOperation("+")} 
          className={operatorButtonClass}
          title="Addition"
        >
          +
        </Button>

        {/* Ligne 5 */}
        <Button 
          onClick={() => inputNumber("0")} 
          className={`${numberButtonClass} col-span-2`}
          title="Saisir le chiffre 0"
        >
          0
        </Button>
        <Button 
          onClick={inputDecimal} 
          className={numberButtonClass}
          title="Ajouter une virgule décimale"
        >
          .
        </Button>
        <Button 
          onClick={calculate} 
          className={operatorButtonClass}
          title="Calculer le résultat"
        >
          =
        </Button>
      </div>
    </div>
  )
} 