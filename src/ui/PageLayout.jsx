function PageLayout({ title, subtitle, children, actions }) {
  return (
    <div className="page">
      <header className="page-header">
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </header>

      <main className="page-content">{children}</main>

      {actions && <footer className="page-actions">{actions}</footer>}
    </div>
  );
}

export default PageLayout;
