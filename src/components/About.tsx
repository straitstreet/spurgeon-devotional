export function About() {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="card">
        <h2 className="mb-4">About Spurgeon Devotional</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            This beautiful, lightweight devotional app features Charles Haddon Spurgeon's timeless 
            "Morning and Evening" daily readings. Known as the "Prince of Preachers," Spurgeon's 
            profound insights and eloquent prose have guided millions in their daily walk with God.
          </p>
          
          <p style={{ marginBottom: '1rem' }}>
            Each day offers two devotional readings—one for morning reflection and one for evening 
            contemplation—providing spiritual nourishment and biblical wisdom for every day of the year.
          </p>
        </div>

        <div style={{ 
          padding: '1rem',
          background: 'var(--color-brown-100)',
          borderRadius: 'var(--radius)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1rem',
            marginBottom: '0.5rem',
            color: 'var(--color-brown-800)'
          }}>
            About Charles H. Spurgeon
          </h3>
          <p style={{ 
            fontSize: '0.875rem',
            color: 'var(--color-brown-700)',
            margin: 0
          }}>
            Charles Haddon Spurgeon (1834-1892) was a British Reformed Baptist preacher who 
            remains highly influential among Christians today. His powerful preaching, 
            devotional writings, and commitment to biblical truth earned him the title 
            "Prince of Preachers."
          </p>
        </div>

        <div style={{
          borderTop: '1px solid var(--color-brown-100)',
          paddingTop: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '0.875rem',
            color: 'var(--color-brown-600)',
            marginBottom: '1rem'
          }}>
            Developed with care by{' '}
            <a 
              href="https://straitstreet.co" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'var(--color-gold-500)',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              StraitStreet
            </a>
          </p>
          
          <div>
            <a 
              href="#support" 
              className="btn btn-primary"
              style={{ marginRight: '0.5rem' }}
            >
              Support This Project
            </a>
            <a 
              href="https://github.com/straitstreet/spurgeon-devotional" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View Source
            </a>
          </div>
          
          <p style={{ 
            fontSize: '0.75rem',
            color: 'var(--color-brown-500)',
            marginTop: '1rem'
          }}>
            Spurgeon's works are in the public domain. App content sourced from 
            Christian Classics Ethereal Library.
          </p>
        </div>
      </div>
    </div>
  );
}