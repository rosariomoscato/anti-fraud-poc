
export function SiteFooter() {
  return (
    <footer className="border-t bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Anti-Fraud System</h3>
            <p className="text-sm text-gray-600">
              Sistema avanzato di rilevamento frodi per sinistri automobilistici 
              con intelligenza artificiale e machine learning.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Funzionalità</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/analytics" className="hover:text-gray-900">Analytics Dashboard</a></li>
              <li><a href="/synthetic-data" className="hover:text-gray-900">Dati Sintetici</a></li>
              <li><a href="/investigations" className="hover:text-gray-900">Gestione Indagini</a></li>
              <li><a href="/risk-assessment" className="hover:text-gray-900">Risk Scoring</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Risorse</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/docs" className="hover:text-gray-900">Documentazione</a></li>
              <li><a href="/api" className="hover:text-gray-900">API Reference</a></li>
              <li><a href="/support" className="hover:text-gray-900">Supporto</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Tecnologia</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Next.js 15 + TypeScript</li>
              <li>PostgreSQL + Drizzle ORM</li>
              <li>Machine Learning Algorithms</li>
              <li>shadcn/ui + Tailwind CSS</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 Anti-Fraud System. Proof of Concept per investigazioni assicurative.</p>
        </div>
      </div>
    </footer>
  );
}
