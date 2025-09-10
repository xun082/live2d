import { useIsMobile } from '../../hooks/useIsMobile'

interface DragHandleProps {
	x: number
	setX: (x: number) => void
	leftGap: number
	rightGap: number
}

export function DragHandle({ x, setX, leftGap, rightGap }: DragHandleProps) {
	const isMobile = useIsMobile()

	if (isMobile) {
		return null
	}

	return (
		<div
			className='absolute top-0 bottom-0 w-1 bg-transparent cursor-col-resize z-10'
			style={{ left: `${x}px` }}
			onMouseDown={(e) => {
				e.preventDefault()
				const startX = e.clientX
				const startWidth = x

				const handleMouseMove = (e: MouseEvent) => {
					const deltaX = startX - e.clientX
					const newWidth = startWidth + deltaX
					const clampedWidth = Math.max(leftGap, Math.min(rightGap, newWidth))
					setX(clampedWidth)
				}

				const handleMouseUp = () => {
					document.removeEventListener('mousemove', handleMouseMove)
					document.removeEventListener('mouseup', handleMouseUp)
				}

				document.addEventListener('mousemove', handleMouseMove)
				document.addEventListener('mouseup', handleMouseUp)
			}}
		/>
	)
}
