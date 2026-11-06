import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

/**
 * Generic hook for API calls with loading/error states.
 */
export default function useApi(url, options = {}) {
  const { immediate = true, params = {} } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (overrideParams) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(url, { params: overrideParams || params })
      setData(res.data)
      return res.data
    } catch (err) {
      const msg = err.response?.data?.errors?.detail || err.message
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (immediate) execute()
  }, [immediate])

  return { data, loading, error, execute, setData }
}
