"use client"

import { ListeningEditorPage } from "@/components/ListeningEditorPage/listening-editor-page"

interface ListeningInputProps {
  onLoaded: () => void
  darkMode: boolean
  onBack?: () => void
}

export default function ListeningInput(props: ListeningInputProps) {
  return <ListeningEditorPage {...props} />
}
