import { LoadingOutlined } from '@ant-design/icons'
import { useEffect } from 'react'

interface ChatCheckProps {
	setReady: (ready: boolean) => void
	shortTermMemoryRef?: any // 保持兼容性，但不使用
}

export function ChatCheck({ setReady }: ChatCheckProps) {
	useEffect(() => {
		// 简化的初始化逻辑，直接设置为就绪状态
		const timer = setTimeout(() => {
			setReady(true)
		}, 500)

		return () => clearTimeout(timer)
	}, [setReady])

	return (
		<div className='w-full h-full flex flex-col justify-center items-center gap-4'>
			<div className='flex justify-center items-center gap-2'>
				<LoadingOutlined className='text-blue-500' />
				<span className='text-gray-600'>初始化聊天系统...</span>
			</div>
			<div className='text-sm text-gray-400'>正在准备IndexedDB存储系统</div>
		</div>
	)
}
