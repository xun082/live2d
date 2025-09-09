import { Button } from 'antd'
import { db } from '../lib/db/index.ts'
import { useStates } from '../lib/hooks/useStates.ts'

export function Debug() {
	const messageApi = useStates((state) => state.messageApi)

	const resetAllMemory = async () => {
		try {
			await db.clearAllData()
			messageApi?.success('所有数据已重置')
		} catch (error) {
			messageApi?.error('重置失败')
		}
	}

	return (
		<div className='fixed bottom-4 right-4 z-50 p-4 bg-white border border-gray-300 rounded-lg shadow-lg'>
			<h3 className='text-sm font-semibold mb-2'>调试工具</h3>
			<div className='space-y-2'>
				<Button size='small' onClick={resetAllMemory} danger>
					重置所有数据
				</Button>
			</div>
		</div>
	)
}
