import { RotateCcw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../../../components/ui/tooltip'
import { useChatApi } from '../../../stores/useChatApi.ts'

export default function ConfigMainPage() {
	const openaiEndpoint = useChatApi((state) => state.openaiEndpoint)
	const openaiApiKey = useChatApi((state) => state.openaiApiKey)
	const openaiModelName = useChatApi((state) => state.openaiModelName)
	const setOpenaiEndpoint = useChatApi((state) => state.setOpenaiEndpoint)
	const setOpenaiApiKey = useChatApi((state) => state.setOpenaiApiKey)
	const setOpenaiModelName = useChatApi((state) => state.setOpenaiModelName)

	// Form state management
	const [endpointValue, setEndpointValue] = useState(openaiEndpoint)
	const [apiKeyValue, setApiKeyValue] = useState(openaiApiKey)
	const [modelNameValue, setModelNameValue] = useState(openaiModelName)

	const [openaiModelNameModified, setOpenaiModelNameModified] = useState(false)
	const [openaiApiKeyModified, setOpenaiApiKeyModified] = useState(false)
	const [openaiEndpointModified, setOpenaiEndpointModified] = useState(false)

	// Sync form values with store values
	useEffect(() => setEndpointValue(openaiEndpoint), [openaiEndpoint])
	useEffect(() => setApiKeyValue(openaiApiKey), [openaiApiKey])
	useEffect(() => setModelNameValue(openaiModelName), [openaiModelName])

	return (
		<TooltipProvider>
			<Card className='w-full overflow-auto max-h-full'>
				<CardContent className='p-6 space-y-6'>
					{/* OpenAI Endpoint Configuration */}
					<div className='space-y-2'>
						<Label className='text-sm font-medium'>
							推理服务地址 <Badge variant='secondary'>OpenAI Endpoint</Badge>
						</Label>
						<div className='flex gap-2'>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='outline'
										size='icon'
										onClick={async () => {
											await setOpenaiEndpoint()
											setOpenaiEndpointModified(false)
											toast.success('推理服务地址已恢复默认值')
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
								value={endpointValue}
								onChange={(e) => {
									setEndpointValue(e.target.value)
									setOpenaiEndpointModified(true)
								}}
								placeholder='请输入推理服务地址'
								className='flex-1'
							/>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant={openaiEndpointModified ? 'default' : 'outline'}
										size='icon'
										onClick={async () => {
											if (!endpointValue)
												return toast.error('请输入推理服务地址')
											await setOpenaiEndpoint(
												endpointValue.endsWith('/')
													? endpointValue
													: `${endpointValue}/`,
											)
											setOpenaiEndpointModified(false)
											toast.success('推理服务地址已更新')
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

					{/* OpenAI API Key Configuration */}
					<div className='space-y-2'>
						<Label className='text-sm font-medium'>
							推理服务密钥 <Badge variant='secondary'>OpenAI API Key</Badge>
						</Label>
						<div className='flex gap-2'>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='outline'
										size='icon'
										onClick={async () => {
											await setOpenaiApiKey()
											setOpenaiApiKeyModified(false)
											toast.success('推理服务密钥已恢复默认值')
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
								type='password'
								value={apiKeyValue}
								onChange={(e) => {
									setApiKeyValue(e.target.value)
									setOpenaiApiKeyModified(true)
								}}
								placeholder='请输入推理服务密钥'
								className='flex-1'
							/>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant={openaiApiKeyModified ? 'default' : 'outline'}
										size='icon'
										onClick={async () => {
											if (!apiKeyValue) return toast.error('请输入推理服务密钥')
											await setOpenaiApiKey(apiKeyValue)
											setOpenaiApiKeyModified(false)
											toast.success('推理服务密钥已更新')
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

					{/* OpenAI Model Name Configuration */}
					<div className='space-y-2'>
						<Label className='text-sm font-medium'>
							推理服务模型 <Badge variant='secondary'>OpenAI Model Name</Badge>
						</Label>
						<div className='flex gap-2'>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='outline'
										size='icon'
										onClick={async () => {
											await setOpenaiModelName()
											setOpenaiModelNameModified(false)
											toast.success('推理服务模型已恢复默认值')
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
								value={modelNameValue}
								onChange={(e) => {
									setModelNameValue(e.target.value)
									setOpenaiModelNameModified(true)
								}}
								placeholder='请输入推理服务模型'
								className='flex-1'
							/>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant={openaiModelNameModified ? 'default' : 'outline'}
										size='icon'
										onClick={async () => {
											if (!modelNameValue)
												return toast.error('请输入推理服务模型')
											await setOpenaiModelName(modelNameValue)
											setOpenaiModelNameModified(false)
											toast.success('推理服务模型已更新')
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
				</CardContent>
			</Card>
		</TooltipProvider>
	)
}
