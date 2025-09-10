import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Image, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { toBase64 } from '../../../lib/utils.ts'
import { useLive2dApi } from '../../../stores/useLive2dApi.ts'

export default function ConfigLayoutPage() {
	const setLoadLive2d = useLive2dApi((state) => state.setLoadLive2d)
	const live2dList = useLive2dApi((state) => state.live2dList)
	const live2dName = useLive2dApi((state) => state.live2dName)
	const setBackground = useLive2dApi((state) => state.setBackground)
	const isFullScreen = useLive2dApi((state) => state.isFullScreen)
	const setIsFullScreen = useLive2dApi((state) => state.setIsFullScreen)
	const live2dPositionY = useLive2dApi((state) => state.live2dPositionY)
	const setLive2dPositionY = useLive2dApi((state) => state.setLive2dPositionY)
	const live2dPositionX = useLive2dApi((state) => state.live2dPositionX)
	const setLive2dPositionX = useLive2dApi((state) => state.setLive2dPositionX)
	const live2dScale = useLive2dApi((state) => state.live2dScale)
	const setLive2dScale = useLive2dApi((state) => state.setLive2dScale)
	const selfName = '小助手'

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			const base64 = toBase64(await file.arrayBuffer())
			await setBackground(`data:${file.type};base64,${base64}`)
			toast.success('背景设置成功')
		} catch (e) {
			toast.error(`背景设置失败: ${e instanceof Error ? e.message : e}`)
		}
	}

	return (
		<div className='w-full bg-white border border-blue-900 rounded-md px-5 pb-0 pt-4 overflow-auto max-h-full'>
			<div className='space-y-6'>
				{/* 聊天形象 */}
				<div className='space-y-2'>
					<Label htmlFor='live2d-model'>聊天形象</Label>
					<Select
						value={live2dName}
						onValueChange={async (value: string) => {
							await setLoadLive2d(value)
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder='选择聊天形象' />
						</SelectTrigger>
						<SelectContent>
							{live2dList.map((name) => (
								<SelectItem key={name} value={name}>
									{name.replace('{name}', selfName)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* 模型垂直位置 */}
				<div className='space-y-2'>
					<Label htmlFor='position-y'>
						模型垂直位置
						{live2dPositionY === 0
							? ''
							: ` [${
									live2dPositionY > 0
										? `向下偏移${live2dPositionY}像素`
										: `向上偏移${-live2dPositionY}像素`
								}]`}
					</Label>
					<Slider
						id='position-y'
						min={-300}
						max={300}
						step={5}
						value={[live2dPositionY]}
						onValueChange={(value: number[]) => {
							setLive2dPositionY(value[0])
						}}
						className='w-full'
					/>
				</div>

				{/* 模型水平位置 */}
				<div className='space-y-2'>
					<Label htmlFor='position-x'>
						模型水平位置
						{live2dPositionX === 0
							? ''
							: ` [${
									live2dPositionX > 0
										? `向右偏移${live2dPositionX}像素`
										: `向左偏移${-live2dPositionX}像素`
								}]`}
					</Label>
					<Slider
						id='position-x'
						min={-600}
						max={600}
						step={10}
						value={[live2dPositionX]}
						onValueChange={(value: number[]) => {
							setLive2dPositionX(value[0])
						}}
						className='w-full'
					/>
				</div>

				{/* 模型缩放 */}
				<div className='space-y-2'>
					<Label htmlFor='scale'>
						模型缩放
						{live2dScale === 1 ? '' : ` [${(live2dScale * 100).toFixed(0)}%]`}
					</Label>
					<Slider
						id='scale'
						min={0.5}
						max={3.0}
						step={0.1}
						value={[live2dScale]}
						onValueChange={(value: number[]) => {
							setLive2dScale(value[0])
						}}
						className='w-full'
					/>
				</div>

				{/* 背景图片 */}
				<div className='space-y-2'>
					<Label>背景图片</Label>
					<div className='flex flex-col items-center gap-4'>
						<div className='w-full'>
							<Input
								type='file'
								accept='.jpg,.jpeg,.png'
								onChange={handleFileUpload}
								className='hidden'
								id='background-upload'
							/>
							<Label
								htmlFor='background-upload'
								className='flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'
							>
								<div className='flex flex-col items-center justify-center pt-5 pb-6'>
									<Image className='w-8 h-8 mb-4 text-gray-500' />
									<p className='mb-2 text-sm text-gray-500'>
										<span className='font-semibold'>点击上传</span>{' '}
										或拖拽文件到此处
									</p>
									<p className='text-xs text-gray-500'>JPG, PNG (最大 10MB)</p>
								</div>
							</Label>
						</div>
						<Button
							variant='outline'
							className='w-full'
							onClick={async () => {
								await setBackground()
								toast.success('已恢复默认背景')
							}}
						>
							<RotateCcw className='w-4 h-4 mr-2' />
							恢复默认背景
						</Button>
					</div>
				</div>

				{/* 背景图片显示区域 */}
				<div className='space-y-2'>
					<Label htmlFor='background-display'>背景图片显示区域</Label>
					<Select
						value={isFullScreen.toString()}
						onValueChange={async (value: string) => {
							await setIsFullScreen(value === 'true')
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder='选择显示区域' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='true'>全屏</SelectItem>
							<SelectItem value='false'>模型区域</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	)
}
