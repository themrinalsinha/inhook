import React from 'react'
import { cn } from '../libs/util'

export const Container = ({
  children,
  className
}: {
  children: React.ReactNode,
  className?: string
}) => {
  return (
    <div className={cn(
      className ?? ""
    )}>
      {children}
    </div>
  )
}
