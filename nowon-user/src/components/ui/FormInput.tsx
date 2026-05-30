import type { InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

/**
 * 로그인/회원가입 폼에서 반복 사용하는 라벨 + 인풋 조합.
 * 동일한 Tailwind 클래스 문자열이 폼마다 중복되던 것을 통합한다.
 * label 외 모든 표준 input 속성(type, value, onChange, required, autoComplete 등)을 그대로 전달한다.
 */
export default function FormInput({ label, ...inputProps }: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        {...inputProps}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
      />
    </div>
  )
}
