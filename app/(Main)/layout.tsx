import { SubjectProvider } from "@/lib/subject-context"
import { getSubjects } from "@/lib/actions/db"
import RootLayoutClient from "@/components/root-layout-client"
import { DarkModeProvider } from "@/lib/dark-mode-context"
import { createClient } from "@/lib/supabase/server"

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  
  // Extract username from metadata (it's populated on signup)
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || "User"

  const subjects = await getSubjects()

  return (
    <SubjectProvider initialDbSubjects={subjects}>
      <DarkModeProvider>
        <RootLayoutClient isLoggedIn={isLoggedIn} username={username}>
          {children}
        </RootLayoutClient>
      </DarkModeProvider>
    </SubjectProvider>
  )
}
