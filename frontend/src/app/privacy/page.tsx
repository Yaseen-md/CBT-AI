import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy - CBT AI',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-gray-900">
                        <span>🧠 CBT AI</span>
                    </Link>
                    <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-700">
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                
                <div className="prose prose-indigo max-w-none text-gray-700 space-y-6">
                    <p>Last updated: {new Date().toLocaleDateString('en-US')}</p>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us when using CBT AI:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Account information (name, email address, password hash)</li>
                            <li>Chat messages and audio recordings from your conversations</li>
                            <li>Journal entries, tags, and AI-generated session summaries</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. How We Use Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Provide, personalize, and improve our AI therapy assistant</li>
                            <li>Detect potential mental health crises and provide resources</li>
                            <li>Analyze usage trends and technical issues</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Security</h2>
                        <p>
                            We employ standard security measures including XSS protections, rate limiting, and 
                            secure password hashing. However, remember that no method of transmission over the 
                            Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Disclaimer</h2>
                        <p>
                            CBT AI is an artificial intelligence application and is not a substitute for professional 
                            mental health care. In case of emergency, immediately contact local emergency services.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
