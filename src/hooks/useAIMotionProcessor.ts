import { useCallback, useEffect, useRef } from 'react'
import { useChatApi } from '../stores/useChatApi.ts'
import { useLive2dApi } from '../stores/useLive2dApi.ts'

export const useAIMotionProcessor = () => {
	const { live2d } = useLive2dApi()
	const setMotionProcessor = useChatApi((state) => state.setMotionProcessor)

	// Live2D motion functions
	const playRandomMotion = useCallback(
		async (group: string) => {
			if (!live2d) return false
			try {
				return await live2d.playMotion(group)
			} catch (error) {
				console.error('Error playing motion:', error)
				return false
			}
		},
		[live2d],
	)

	const playSpecificMotion = useCallback(
		async (group: string, index: number) => {
			if (!live2d) return false
			try {
				return await live2d.playMotion(group, index)
			} catch (error) {
				console.error('Error playing motion:', error)
				return false
			}
		},
		[live2d],
	)
	const lastMotionRef = useRef<string>('Idle')
	const motionCounterRef = useRef<number>(0)

	useEffect(() => {
		const processAIResponse = (content: string) => {
			try {
				// Increment counter for variety
				motionCounterRef.current += 1

				// Check for special motion commands in the AI response
				const motionMatches = content.match(/\[MOTION:(\w+)(?::(\d+))?\]/g)

				if (motionMatches && motionMatches.length > 0) {
					// Process multiple motion commands with delays
					const processMotionCommands = async () => {
						for (let i = 0; i < motionMatches.length; i++) {
							const match = motionMatches[i].match(
								/\[MOTION:(\w+)(?::(\d+))?\]/,
							)
							if (match) {
								const [, group, indexStr] = match
								const index = indexStr ? Number.parseInt(indexStr) : undefined

								console.log(
									`[Live2D Motion] AI Command ${i + 1}/${
										motionMatches.length
									}: ${match[0]} -> Group: ${group}, Index: ${index}`,
								)

								if (index !== undefined) {
									playSpecificMotion(group, index)
								} else {
									playRandomMotion(group)
								}
								lastMotionRef.current = group

								// Add delay between motions for better visual effect
								if (i < motionMatches.length - 1) {
									await new Promise((resolve) => setTimeout(resolve, 1500)) // 1.5s delay between motions
								}
							}
						}
					}

					// Start processing motion commands
					processMotionCommands()
					return
				}

				// Fallback: Enhanced sentiment-based motion triggering if no command found
				const lowerContent = content.toLowerCase()
				let selectedMotion = 'Idle'
				let shouldUseSpecific = false

				// Happy emotions - use varied Tap motions
				if (
					lowerContent.includes('哈哈') ||
					lowerContent.includes('开心') ||
					lowerContent.includes('高兴') ||
					lowerContent.includes('快乐') ||
					lowerContent.includes('兴奋') ||
					lowerContent.includes('太好了') ||
					lowerContent.includes('棒') ||
					lowerContent.includes('😊') ||
					lowerContent.includes('😄') ||
					lowerContent.includes('😆') ||
					lowerContent.includes('🎉') ||
					lowerContent.includes('happy') ||
					lowerContent.includes('great') ||
					lowerContent.includes('wonderful') ||
					lowerContent.includes('awesome') ||
					lowerContent.includes('fantastic') ||
					lowerContent.includes('excellent')
				) {
					selectedMotion = 'Tap'
					shouldUseSpecific = true
				}
				// Surprised emotions
				else if (
					lowerContent.includes('哇') ||
					lowerContent.includes('惊讶') ||
					lowerContent.includes('不敢相信') ||
					lowerContent.includes('震惊') ||
					lowerContent.includes('意外') ||
					lowerContent.includes('😲') ||
					lowerContent.includes('😮') ||
					lowerContent.includes('😱') ||
					lowerContent.includes('wow') ||
					lowerContent.includes('amazing') ||
					lowerContent.includes('incredible') ||
					lowerContent.includes('surprising') ||
					lowerContent.includes('unbelievable')
				) {
					selectedMotion = 'FlickUp'
				}
				// Sad or disappointing emotions
				else if (
					lowerContent.includes('难过') ||
					lowerContent.includes('伤心') ||
					lowerContent.includes('失望') ||
					lowerContent.includes('抱歉') ||
					lowerContent.includes('对不起') ||
					lowerContent.includes('遗憾') ||
					lowerContent.includes('😢') ||
					lowerContent.includes('😞') ||
					lowerContent.includes('😔') ||
					lowerContent.includes('sad') ||
					lowerContent.includes('sorry') ||
					lowerContent.includes('disappointed') ||
					lowerContent.includes('regret')
				) {
					selectedMotion = 'FlickDown'
				}
				// Thinking or pondering
				else if (
					lowerContent.includes('想想') ||
					lowerContent.includes('思考') ||
					lowerContent.includes('让我想想') ||
					lowerContent.includes('考虑') ||
					lowerContent.includes('分析') ||
					lowerContent.includes('🤔') ||
					lowerContent.includes('thinking') ||
					lowerContent.includes('let me think') ||
					lowerContent.includes('consider') ||
					lowerContent.includes('analyze')
				) {
					selectedMotion = 'Flick'
				}
				// Questions
				else if (
					lowerContent.includes('?') ||
					lowerContent.includes('？') ||
					lowerContent.includes('怎么') ||
					lowerContent.includes('什么') ||
					lowerContent.includes('为什么') ||
					lowerContent.includes('如何') ||
					lowerContent.includes('how') ||
					lowerContent.includes('what') ||
					lowerContent.includes('why')
				) {
					selectedMotion = 'Flick'
				}
				// Greetings
				else if (
					lowerContent.includes('你好') ||
					lowerContent.includes('hello') ||
					lowerContent.includes('hi') ||
					lowerContent.includes('欢迎') ||
					lowerContent.includes('welcome')
				) {
					selectedMotion = 'Tap'
					shouldUseSpecific = true
				}
				// Default: cycle through motions to keep it interesting
				else {
					const defaultMotions = ['Idle', 'Tap', 'Flick']
					selectedMotion =
						defaultMotions[motionCounterRef.current % defaultMotions.length]
					shouldUseSpecific = selectedMotion !== 'Idle'
				}

				// Execute the motion
				if (
					shouldUseSpecific &&
					(selectedMotion === 'Tap' || selectedMotion === 'Idle')
				) {
					// Use specific indices for variety
					const maxIndex = selectedMotion === 'Tap' ? 3 : 3 // Both Tap and Idle have 3 variations
					const index = motionCounterRef.current % maxIndex
					playSpecificMotion(selectedMotion, index)
					console.log(
						`[Live2D Motion] Sentiment: "${content.substring(
							0,
							30,
						)}..." -> ${selectedMotion}[${index}]`,
					)
				} else {
					playRandomMotion(selectedMotion)
					console.log(
						`[Live2D Motion] Sentiment: "${content.substring(
							0,
							30,
						)}..." -> ${selectedMotion}[random]`,
					)
				}

				lastMotionRef.current = selectedMotion
			} catch (error) {
				console.error('Error processing AI response for Live2D motions:', error)
				// Fallback to safe motion
				playRandomMotion('Idle')
			}
		}

		// Register the motion processor
		setMotionProcessor(processAIResponse)

		// Cleanup on unmount
		return () => {
			setMotionProcessor(() => {}) // Set empty function as cleanup
		}
	}, [playRandomMotion, playSpecificMotion, setMotionProcessor])
}
