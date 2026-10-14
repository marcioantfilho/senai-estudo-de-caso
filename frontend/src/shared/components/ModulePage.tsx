type ModulePageProps = {
  title: string
  description: string
}

export default function ModulePage({ title, description }: ModulePageProps) {
  return (
    <section aria-labelledby="module-title">
      <h1 id="module-title">{title}</h1>
      <p className="module-description">{description}</p>
      <p className="module-notice">As funcionalidades deste módulo ainda não estão disponíveis.</p>
    </section>
  )
}
