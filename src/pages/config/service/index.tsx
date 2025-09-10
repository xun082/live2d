import { Info, RotateCcw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../../../components/ui/select'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../../../components/ui/tooltip'
import { useListenApi } from '../../../stores/useListenApi.ts'
import { useSpeakApi } from '../../../stores/useSpeakApi.ts'

export default function ConfigServicePage() {
	const setSpeakApi = useSpeakApi((state) => state.setSpeakApi)
	const speakApiList = useSpeakApi((state) => state.speakApiList)
	const currentSpeakApi = useSpeakApi((state) => state.currentSpeakApi)
	const f5TtsEndpoint = useSpeakApi((state) => state.f5TtsEndpoint)
	const fishSpeechEndpoint = useSpeakApi((state) => state.fishSpeechEndpoint)
	const setF5TtsEndpoint = useSpeakApi((state) => state.setF5TtsEndpoint)
	const setFishSpeechEndpoint = useSpeakApi(
		(state) => state.setFishSpeechEndpoint,
	)
	const setListenApi = useListenApi((state) => state.setListenApi)
	const listenApiList = useListenApi((state) => state.listenApiList)
	const currentListenApi = useListenApi((state) => state.currentListenApi)

	// Form state management
	const [f5TtsEndpointValue, setF5TtsEndpointValue] = useState(f5TtsEndpoint)
	const [fishSpeechEndpointValue, setFishSpeechEndpointValue] =
		useState(fishSpeechEndpoint)

	const [f5TtsEndpointModified, setF5TtsEndpointModified] = useState(false)
	const [fishSpeechEndpointModified, setFishSpeechEndpointModified] =
		useState(false)

	// Sync form values with store values
	useEffect(() => setF5TtsEndpointValue(f5TtsEndpoint), [f5TtsEndpoint])
	useEffect(
		() => setFishSpeechEndpointValue(fishSpeechEndpoint),
		[fishSpeechEndpoint],
	)

	return (
		<TooltipProvider>
			<Card className='w-full overflow-auto max-h-full'>
				<CardContent className='p-6 space-y-6'>
					{/* Speech Synthesis Service */}
					<div className='space-y-2'>
						<Label className='text-sm font-medium flex items-center gap-2'>
							语音合成服务
							<Tooltip>
								<TooltipTrigger asChild>
									<Info className='h-4 w-4 text-muted-foreground' />
								</TooltipTrigger>
								<TooltipContent>
									<p>
										在连续语音对话时, Safari 浏览器可能会阻止应用直接播放音频,
										建议使用 Chrome、Edge 或 Firefox 浏览器
									</p>
								</TooltipContent>
							</Tooltip>
						</Label>
						<Select
							value={currentSpeakApi}
							onValueChange={async (value) => {
								await setSpeakApi(value)
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder='选择语音合成服务' />
							</SelectTrigger>
							<SelectContent>
								{speakApiList.map((name) => (
									<SelectItem key={name} value={name}>
										{name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* F5 TTS API Endpoint */}
					<div className='space-y-2'>
						<Label className='text-sm font-medium'>F5 TTS API Endpoint</Label>
						<div className='flex gap-2'>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='outline'
										size='icon'
										onClick={async () => {
											await setF5TtsEndpoint()
											setF5TtsEndpointModified(false)
											toast.success('F5 TTS API Endpoint 已恢复默认值')
										}}
									>
										<RotateCcw className='h-4 w-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>恢复默认值</p>
								</TooltipContent>
							</Tooltip>
							<Input
								value={f5TtsEndpointValue}
								onChange={(e) => {
									setF5TtsEndpointValue(e.target.value)
									setF5TtsEndpointModified(true)
								}}
								placeholder='请输入 F5 TTS API Endpoint'
								className='flex-1'
							/>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant={f5TtsEndpointModified ? 'default' : 'outline'}
										size='icon'
										onClick={async () => {
											await setF5TtsEndpoint(f5TtsEndpointValue)
											setF5TtsEndpointModified(false)
											toast.success('F5 TTS API Endpoint 已更新')
										}}
									>
										<Save className='h-4 w-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>保存修改</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>

					{/* Fish Speech API Endpoint */}
					<div className='space-y-2'>
						<Label className='text-sm font-medium'>
							Fish Speech API Endpoint
						</Label>
						<div className='flex gap-2'>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='outline'
										size='icon'
										onClick={async () => {
											await setFishSpeechEndpoint()
											setFishSpeechEndpointModified(false)
											toast.success('Fish Speech API Endpoint 已恢复默认值')
										}}
									>
										<RotateCcw className='h-4 w-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>恢复默认值</p>
								</TooltipContent>
							</Tooltip>
							<Input
								value={fishSpeechEndpointValue}
								onChange={(e) => {
									setFishSpeechEndpointValue(e.target.value)
									setFishSpeechEndpointModified(true)
								}}
								placeholder='请输入 Fish Speech API Endpoint'
								className='flex-1'
							/>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant={fishSpeechEndpointModified ? 'default' : 'outline'}
										size='icon'
										onClick={async () => {
											await setFishSpeechEndpoint(fishSpeechEndpointValue)
											setFishSpeechEndpointModified(false)
											toast.success('Fish Speech API Endpoint 已更新')
										}}
									>
										<Save className='h-4 w-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>保存修改</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>

					{/* Divider */}
					<hr className='border-t border-border' />

					{/* Speech Recognition Service */}
					<div className='space-y-2'>
						<Label className='text-sm font-medium'>语音识别服务</Label>
						<Select
							value={currentListenApi}
							onValueChange={async (value) => {
								await setListenApi(value)
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder='选择语音识别服务' />
							</SelectTrigger>
							<SelectContent>
								{listenApiList.map((name) => (
									<SelectItem key={name} value={name}>
										{name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>
		</TooltipProvider>
	)
}
