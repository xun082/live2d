import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

export default function MemoryPage() {
	const [userName, setUserName] = useState('用户')
	const [selfName, setSelfName] = useState('小助手')
	const [memoryAboutSelf, setMemoryAboutSelf] = useState('')
	const [memoryAboutUser, setMemoryAboutUser] = useState('')

	const handleSave = () => {
		// 在简化版本中，这些设置只是本地状态
		toast.success('设置已保存（本地会话有效）')
	}

	return (
		<Card className='w-full overflow-auto max-h-full'>
			<CardContent className='p-6 space-y-6'>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						handleSave()
					}}
					className='space-y-6'
				>
					{/* User Name */}
					<div className='space-y-2'>
						<Label htmlFor='userName' className='text-sm font-medium'>
							用户名称
						</Label>
						<Input
							id='userName'
							value={userName}
							onChange={(e) => setUserName(e.target.value)}
							placeholder='请输入用户名称'
						/>
					</div>

					{/* Assistant Name */}
					<div className='space-y-2'>
						<Label htmlFor='selfName' className='text-sm font-medium'>
							助手名称
						</Label>
						<Input
							id='selfName'
							value={selfName}
							onChange={(e) => setSelfName(e.target.value)}
							placeholder='请输入助手名称'
						/>
					</div>

					{/* Memory About Self */}
					<div className='space-y-2'>
						<Label htmlFor='memoryAboutSelf' className='text-sm font-medium'>
							关于助手的记忆
						</Label>
						<Textarea
							id='memoryAboutSelf'
							value={memoryAboutSelf}
							onChange={(e) => setMemoryAboutSelf(e.target.value)}
							placeholder='描述助手的特点、性格等...'
							rows={4}
						/>
					</div>

					{/* Memory About User */}
					<div className='space-y-2'>
						<Label htmlFor='memoryAboutUser' className='text-sm font-medium'>
							关于用户的记忆
						</Label>
						<Textarea
							id='memoryAboutUser'
							value={memoryAboutUser}
							onChange={(e) => setMemoryAboutUser(e.target.value)}
							placeholder='记录用户的偏好、特点等...'
							rows={4}
						/>
					</div>

					{/* Action Buttons */}
					<div className='flex gap-3'>
						<Button type='submit'>保存设置</Button>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								setUserName('用户')
								setSelfName('小助手')
								setMemoryAboutSelf('')
								setMemoryAboutUser('')
								toast.success('已重置为默认值')
							}}
						>
							重置
						</Button>
					</div>
				</form>

				{/* Information Section */}
				<div className='mt-6 p-4 bg-muted rounded-lg'>
					<h4 className='font-medium mb-2'>说明</h4>
					<p className='text-sm text-muted-foreground'>
						在简化版本中，这些设置仅在当前会话中有效。
						如需持久化存储，可以通过记忆管理功能导出和导入数据。
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
