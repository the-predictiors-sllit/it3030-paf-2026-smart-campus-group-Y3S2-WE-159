'use client'
import React, { useState } from 'react'
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';

export const MarkdownEditor = () => {
    const [markdownValue, setMarkdownValue] = useState<string>("Hello!")
    const { theme, resolvedTheme } = useTheme();

    // const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
    
  return (
    <div data-color-mode={(theme || "dark")}>
        <MDEditor 
        value={markdownValue}
        onChange={(val) => setMarkdownValue(val || "")}
        height={500}
        />
        <div>{markdownValue}</div>
    </div>
  )
}
