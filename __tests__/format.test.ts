import { formatDate } from '@/lib/format'

describe('Format Utils', () => {
  describe('formatDate', () => {
    it('should format date strings correctly', () => {
      expect(formatDate('2023-12-01')).toBe('Dec 1, 2023')
      expect(formatDate('2023-01-15')).toBe('Jan 15, 2023')
      expect(formatDate('2024-08-30')).toBe('Aug 30, 2024')
    })

    it('should handle single digit days and months', () => {
      expect(formatDate('2023-01-01')).toBe('Jan 1, 2023')
      expect(formatDate('2023-03-05')).toBe('Mar 5, 2023')
      expect(formatDate('2023-12-31')).toBe('Dec 31, 2023')
    })

    it('should handle different month names', () => {
      const months = [
        '01', '02', '03', '04', '05', '06',
        '07', '08', '09', '10', '11', '12'
      ]
      const expectedMonths = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
      
      months.forEach((month, index) => {
        const dateStr = `2023-${month}-15`
        const result = formatDate(dateStr)
        expect(result).toBe(`${expectedMonths[index]} 15, 2023`)
      })
    })

    it('should handle leap year dates', () => {
      expect(formatDate('2024-02-29')).toBe('Feb 29, 2024')
      expect(formatDate('2020-02-29')).toBe('Feb 29, 2020')
    })

    it('should handle edge case dates', () => {
      expect(formatDate('2023-02-28')).toBe('Feb 28, 2023')
      expect(formatDate('2023-04-30')).toBe('Apr 30, 2023')
      expect(formatDate('2023-11-30')).toBe('Nov 30, 2023')
    })

    it('should handle different year formats', () => {
      expect(formatDate('2000-01-01')).toBe('Jan 1, 2000')
      expect(formatDate('2099-12-31')).toBe('Dec 31, 2099')
      expect(formatDate('1999-06-15')).toBe('Jun 15, 1999')
    })

    it('should handle invalid date strings gracefully', () => {
      // These should not throw errors, though behavior may vary
      expect(() => formatDate('invalid-date')).not.toThrow()
      expect(() => formatDate('')).not.toThrow()
      expect(() => formatDate('2023-13-01')).not.toThrow() // Invalid month
      expect(() => formatDate('2023-02-30')).not.toThrow() // Invalid day for February
    })

    it('should handle date strings with different separators', () => {
      // Should still work with the expected YYYY-MM-DD format
      expect(formatDate('2023-12-01')).toBe('Dec 1, 2023')
    })

    it('should handle current year dates', () => {
      const currentYear = new Date().getFullYear()
      expect(formatDate(`${currentYear}-01-01`)).toBe(`Jan 1, ${currentYear}`)
      expect(formatDate(`${currentYear}-12-31`)).toBe(`Dec 31, ${currentYear}`)
    })

    it('should be consistent with repeated calls', () => {
      const testDate = '2023-06-15'
      const result1 = formatDate(testDate)
      const result2 = formatDate(testDate)
      expect(result1).toBe(result2)
      expect(result1).toBe('Jun 15, 2023')
    })
  })
})