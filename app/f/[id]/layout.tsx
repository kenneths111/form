import { Metadata } from 'next'
import { sql } from '@vercel/postgres'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  try {
    const result = await sql`
      SELECT title, description 
      FROM forms 
      WHERE id = ${params.id}
    `

    const form = result.rows[0]

    if (form) {
      return {
        title: form.title,
        description: form.description || 'Fill out this form',
        openGraph: {
          title: form.title,
          description: form.description || 'Fill out this form',
          type: 'website',
          images: [
            {
              url: '/og-image.png',
              width: 800,
              height: 800,
              alt: form.title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: form.title,
          description: form.description || 'Fill out this form',
          images: ['/og-image.png'],
        },
      }
    }
  } catch (error) {
    console.error('Error fetching form for metadata:', error)
  }

  // Fallback metadata
  return {
    title: 'Form',
    description: 'Fill out this form',
  }
}

export default function FormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

