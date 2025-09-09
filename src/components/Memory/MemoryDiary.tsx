import { DeleteOutlined } from '@ant-design/icons'
import { Button, Collapse, Popconfirm, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { type Memory, db } from '../../lib/db/index.ts'
import { useStates } from '../../lib/hooks/useStates.ts'
import { getTime } from '../../lib/utils.ts'

export function MemoryDiary() {
	const messageApi = useStates((state) => state.messageApi)
	const [memories, setMemories] = useState<Memory[]>([])
	const [loading, setLoading] = useState(true)

	// 加载记忆数据
	useEffect(() => {
		const loadMemories = async () => {
			try {
				const allMemories = await db.getAllMemories()
				setMemories(allMemories.sort((a, b) => b.timestamp - a.timestamp))
			} catch (error) {
				messageApi?.error('加载记忆失败')
				console.error('加载记忆失败:', error)
			} finally {
				setLoading(false)
			}
		}

		loadMemories()
	}, [messageApi])

	// 删除记忆
	const deleteMemory = async (memoryId: number) => {
		try {
			await db.memories.delete(memoryId)
			setMemories((prev) => prev.filter((m) => m.id !== memoryId))
			messageApi?.success('记忆已删除')
		} catch (error) {
			messageApi?.error('删除记忆失败')
			console.error('删除记忆失败:', error)
		}
	}

	if (loading) {
		return (
			<div className='w-full bg-white max-h-full border border-blue-900 rounded-md overflow-auto transition-all p-4'>
				<div className='flex justify-center items-center h-32'>
					<span className='text-gray-500'>加载记忆中...</span>
				</div>
			</div>
		)
	}

	return (
		<div className='w-full bg-white max-h-full border border-blue-900 rounded-md overflow-auto transition-all'>
			<Collapse
				style={{ border: 'none' }}
				size='small'
				items={
					memories.length === 0
						? [
								{
									key: 'empty',
									label: (
										<div className='flex justify-between items-center'>
											<span className='text-gray-500'>暂无记忆</span>
										</div>
									),
									children: (
										<div className='text-center text-gray-400 py-8'>
											<p>还没有任何记忆记录</p>
											<p className='text-sm'>开始聊天后会自动生成记忆</p>
										</div>
									),
								},
							]
						: memories.map((memory) => ({
								key: memory.id?.toString() || memory.timestamp.toString(),
								label: (
									<div className='flex justify-between items-center w-full'>
										<div className='flex items-center gap-2'>
											<span className='font-medium'>
												{memory.summary || '记忆摘要'}
											</span>
											<Tag color='blue'>重要度: {memory.importance}</Tag>
											{memory.tags && memory.tags.length > 0 && (
												<div className='flex gap-1'>
													{memory.tags.slice(0, 3).map((tag, index) => (
														<Tag key={index} color='green'>
															{tag}
														</Tag>
													))}
													{memory.tags.length > 3 && (
														<Tag color='default'>+{memory.tags.length - 3}</Tag>
													)}
												</div>
											)}
										</div>
										<div className='flex items-center gap-2'>
											<span className='text-xs text-gray-500'>
												{getTime(memory.timestamp)}
											</span>
											<Popconfirm
												title='确定要删除这条记忆吗？'
												onConfirm={(e) => {
													e?.stopPropagation()
													if (memory.id) {
														deleteMemory(memory.id)
													}
												}}
												okText='确定'
												cancelText='取消'
											>
												<Button
													type='text'
													size='small'
													icon={<DeleteOutlined />}
													danger
													onClick={(e) => e.stopPropagation()}
												/>
											</Popconfirm>
										</div>
									</div>
								),
								children: (
									<div className='space-y-3'>
										<div>
											<h4 className='font-medium text-gray-700 mb-2'>摘要</h4>
											<p className='text-gray-600 bg-gray-50 p-3 rounded'>
												{memory.summary || '无摘要'}
											</p>
										</div>

										<div>
											<h4 className='font-medium text-gray-700 mb-2'>
												详细内容
											</h4>
											<div className='text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap max-h-60 overflow-y-auto'>
												{memory.content || '无详细内容'}
											</div>
										</div>

										<div className='flex justify-between items-center text-sm text-gray-500'>
											<span>创建时间: {getTime(memory.timestamp)}</span>
											<span>重要度: {memory.importance}/10</span>
										</div>

										{memory.tags && memory.tags.length > 0 && (
											<div>
												<h4 className='font-medium text-gray-700 mb-2'>标签</h4>
												<div className='flex flex-wrap gap-1'>
													{memory.tags.map((tag, index) => (
														<Tag key={index} color='blue'>
															{tag}
														</Tag>
													))}
												</div>
											</div>
										)}
									</div>
								),
							}))
				}
			/>
		</div>
	)
}
