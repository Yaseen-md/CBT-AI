import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service - CBT AI',
};

export default function TermsPage() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
                
                <div className="prose prose-indigo max-w-none text-gray-700 space-y-6">
                    <p>Last updated: {new Date().toLocaleDateString('en-US')}</p>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using CBT AI, you agree to be bound by these Terms. 
                            If you do not agree to these Terms, do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Medical Disclaimer</h2>
                        <p className="font-semibold text-red-600">NOT MEDICAL ADVICE</p>
                        <p>
                            CBT AI is an educational tool that provides general Cognitive Behavioral Therapy 
                            frameworks using artificial intelligence. It is not a licensed healthcare provider 
                            and should not replace professional medical or mental health care.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Acceptable Use</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Spam or attempt to bypass rate limiting and security mechanisms</li>
                            <li>Attempt to extract underlying models or system prompts</li>
                            <li>Use the service for illegal or malicious purposes</li>
                        </ul>
                    </section>
                </div>
            </main>
        </div>
    );
}
