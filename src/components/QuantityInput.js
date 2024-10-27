'use client'

import React, { useReducer, useCallback, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus } from "lucide-react"

const reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, value: state.value + 1, inputValue: (state.value + 1).toString() }
    case 'DECREMENT':
      return { ...state, value: state.value - 1, inputValue: (state.value - 1).toString() }
    case 'SET_VALUE':
      return { ...state, value: action.payload, inputValue: action.payload.toString() }
    case 'SET_INPUT_VALUE':
      return { ...state, inputValue: action.payload }
    default:
      return state
  }
}

const QuantityInput = React.memo(({
  quantity,
  minQuantity = 0,
  maxQuantity = 100,
  step = 1,
  onChange
}) => {
  const [state, dispatch] = useReducer(reducer, {
    value: quantity,
    inputValue: quantity.toString()
  })

  const inputRef = useRef(null)
  const debounceTimerRef = useRef(null)

  useEffect(() => {
    if (state.value !== quantity) {
      dispatch({ type: 'SET_VALUE', payload: quantity })
    }
  }, [quantity])

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(state.value + 1, maxQuantity)
    dispatch({ type: 'SET_VALUE', payload: newValue })
    onChange(newValue)
  }, [state.value, maxQuantity, onChange])

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(state.value - 1, minQuantity)
    dispatch({ type: 'SET_VALUE', payload: newValue })
    onChange(newValue)
  }, [state.value, minQuantity, onChange])

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value.replace(/[^\d.-]/g, '')
    dispatch({ type: 'SET_INPUT_VALUE', payload: newValue })

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const parsedValue = parseFloat(newValue)
      if (!isNaN(parsedValue)) {
        const clampedValue = Math.min(Math.max(parsedValue, minQuantity), maxQuantity)
        dispatch({ type: 'SET_VALUE', payload: clampedValue })
        onChange(clampedValue)
      }
    }, 300)
  }, [minQuantity, maxQuantity, onChange])

  const handleBlur = useCallback(() => {
    const parsedValue = parseFloat(state.inputValue)
    if (isNaN(parsedValue)) {
      dispatch({ type: 'SET_VALUE', payload: minQuantity })
      onChange(minQuantity)
    } else {
      const clampedValue = Math.min(Math.max(parsedValue, minQuantity), maxQuantity)
      dispatch({ type: 'SET_VALUE', payload: clampedValue })
      onChange(clampedValue)
    }
  }, [state.inputValue, minQuantity, maxQuantity, onChange])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrement()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDecrement()
    }
  }, [handleIncrement, handleDecrement])

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        disabled={state.value <= minQuantity}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={state.inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-20 text-center"
        aria-label="Quantity"
        min={minQuantity}
        max={maxQuantity}
        step={step}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        disabled={state.value >= maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
})

QuantityInput.displayName = 'QuantityInput'

export default QuantityInput
