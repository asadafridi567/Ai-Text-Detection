# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth & routing >> homepage loads and shows branding
- Location: tests/e2e/auth.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=ZeroPlagiarism')
Expected: visible
Error: strict mode violation: locator('text=ZeroPlagiarism') resolved to 7 elements:
    1) <span class="text-xl font-bold text-foreground">ZeroPlagiarism</span> aka getByRole('link', { name: 'Z ZeroPlagiarism' })
    2) <p class="text-xl text-muted-foreground max-w-2xl mx-auto">See what educators, writers, and professionals sa…</p> aka getByText('See what educators, writers,')
    3) <p class="text-muted-foreground mb-6 leading-relaxed">"ZeroPlagiarism has revolutionized how we handle …</p> aka getByText('"ZeroPlagiarism has')
    4) <p class="text-muted-foreground mb-6 leading-relaxed">"I use ZeroPlagiarism daily to ensure my work is …</p> aka getByText('"I use ZeroPlagiarism daily')
    5) <p class="text-muted-foreground mb-6 leading-relaxed">"ZeroPlagiarism gives us confidence in our conten…</p> aka getByText('"ZeroPlagiarism gives us')
    6) <span class="text-xl font-bold">ZeroPlagiarism</span> aka getByRole('contentinfo').getByText('ZeroPlagiarism', { exact: true })
    7) <p class="text-background/70 text-sm mb-4 md:mb-0">© 2024 ZeroPlagiarism. All rights reserved.</p> aka getByText('© 2024 ZeroPlagiarism. All')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=ZeroPlagiarism')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "Z ZeroPlagiarism" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e7]: Z
          - generic [ref=e9]: ZeroPlagiarism
        - navigation [ref=e10]:
          - button "Features" [ref=e12] [cursor=pointer]
          - link "Blogs" [ref=e15] [cursor=pointer]:
            - /url: /blogs
          - link "About" [ref=e16] [cursor=pointer]:
            - /url: /about
          - link "Contact" [ref=e17] [cursor=pointer]:
            - /url: /contact
        - generic [ref=e18]:
          - link "Sign In" [ref=e19] [cursor=pointer]:
            - /url: /sign-in
          - link "Get Started" [ref=e20] [cursor=pointer]:
            - /url: /dashboard
    - main [ref=e21]:
      - generic [ref=e26]:
        - generic [ref=e27]: Trusted by 50,000+ professionals
        - heading "Detect AI Text, Humanize Content & Check Plagiarism" [level=1] [ref=e31]
        - paragraph [ref=e32]: The complete solution for content authenticity. Detect AI-generated text, transform robotic writing into human-like content, and ensure originality with our advanced plagiarism detection.
        - generic [ref=e33]:
          - link "Try Now" [ref=e34] [cursor=pointer]:
            - /url: /dashboard
          - link "Explore Features" [ref=e35] [cursor=pointer]:
            - /url: "#features"
        - generic [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]: 99.8%
            - paragraph [ref=e42]: Detection Accuracy
          - generic [ref=e43]:
            - generic [ref=e44]: 50K+
            - paragraph [ref=e50]: Active Users
          - generic [ref=e51]:
            - generic [ref=e52]: 4.9★
            - paragraph [ref=e56]: User Rating
      - generic [ref=e58]:
        - generic [ref=e59]:
          - heading "Three Powerful Tools, One Platform" [level=2] [ref=e60]
          - paragraph [ref=e61]: Everything you need to ensure content authenticity, originality, and quality in one comprehensive suite.
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]:
              - heading "AI Text Detection" [level=3] [ref=e69]
              - paragraph [ref=e70]: Instantly identify AI-generated content with 99.8% accuracy using advanced machine learning algorithms.
            - generic [ref=e71]:
              - list [ref=e72]:
                - listitem [ref=e73]: GPT, Claude, Gemini detection
                - listitem [ref=e75]: Real-time analysis
                - listitem [ref=e77]: Detailed confidence scores
              - link "Try Now" [ref=e79] [cursor=pointer]:
                - /url: /ai-detection
          - generic [ref=e80]:
            - generic [ref=e81]:
              - heading "Text Humanizer" [level=3] [ref=e86]
              - paragraph [ref=e87]: Transform robotic AI text into natural, human-like content that passes AI detectors.
            - generic [ref=e88]:
              - list [ref=e89]:
                - listitem [ref=e90]: Natural language processing
                - listitem [ref=e92]: Maintains original meaning
                - listitem [ref=e94]: Multiple writing styles
              - link "Try Now" [ref=e96] [cursor=pointer]:
                - /url: /humanizer
          - generic [ref=e97]:
            - generic [ref=e98]:
              - heading "Plagiarism Checker" [level=3] [ref=e103]
              - paragraph [ref=e104]: Scan billions of web pages and academic papers to ensure your content is 100% original.
            - generic [ref=e105]:
              - list [ref=e106]:
                - listitem [ref=e107]: Comprehensive database
                - listitem [ref=e109]: Citation suggestions
                - listitem [ref=e111]: Similarity reporting
              - link "Try Now" [ref=e113] [cursor=pointer]:
                - /url: /plagiarism-checker
        - link "Get All Tools Free" [ref=e115] [cursor=pointer]:
          - /url: /dashboard
      - generic [ref=e117]:
        - generic [ref=e118]:
          - heading "How It Works" [level=2] [ref=e119]
          - paragraph [ref=e120]: Simple, fast, and reliable. Get professional results in just a few clicks.
        - generic [ref=e121]:
          - generic [ref=e122]:
            - generic [ref=e123]: "1"
            - heading "Upload Your Text" [level=3] [ref=e130]
            - paragraph [ref=e131]: Paste or upload your content directly into our secure platform. Supports various file formats.
          - generic [ref=e133]:
            - generic [ref=e134]: "2"
            - heading "AI Analysis" [level=3] [ref=e143]
            - paragraph [ref=e144]: Our advanced algorithms analyze your text for AI patterns, plagiarism, and quality metrics.
          - generic [ref=e146]:
            - generic [ref=e147]: "3"
            - heading "Get Results" [level=3] [ref=e154]
            - paragraph [ref=e155]: Receive detailed reports with confidence scores, suggestions, and highlighted sections.
          - generic [ref=e157]:
            - generic [ref=e158]: "4"
            - heading "Download & Use" [level=3] [ref=e165]
            - paragraph [ref=e166]: Export your improved content or reports in multiple formats ready for publication.
        - generic [ref=e167]:
          - paragraph [ref=e168]: Ready to ensure your content is authentic and original?
          - generic [ref=e169]:
            - generic [ref=e170]: No credit card required
            - generic [ref=e175]: 14-day free trial
            - generic [ref=e180]: Cancel anytime
      - generic [ref=e186]:
        - generic [ref=e187]:
          - heading "Trusted by Thousands" [level=2] [ref=e188]
          - paragraph [ref=e189]: See what educators, writers, and professionals say about ZeroPlagiarism.
        - generic [ref=e190]:
          - generic [ref=e192]:
            - paragraph [ref=e196]: "\"ZeroPlagiarism has revolutionized how we handle academic integrity. The AI detection is incredibly accurate, and it's become an essential tool for our department.\""
            - generic [ref=e208]:
              - generic [ref=e209]: SC
              - generic [ref=e211]:
                - paragraph [ref=e212]: Dr. Sarah Chen
                - paragraph [ref=e213]: Professor, Stanford University
          - generic [ref=e215]:
            - paragraph [ref=e219]: "\"The humanizer tool is a game-changer. It transforms our AI-generated drafts into content that feels genuinely human while maintaining all the key information.\""
            - generic [ref=e231]:
              - generic [ref=e232]: MR
              - generic [ref=e234]:
                - paragraph [ref=e235]: Mark Rodriguez
                - paragraph [ref=e236]: Content Manager, TechCorp
          - generic [ref=e238]:
            - paragraph [ref=e242]: "\"I use ZeroPlagiarism daily to ensure my work is original and authentic. The plagiarism checker is thorough, and the interface is incredibly user-friendly.\""
            - generic [ref=e254]:
              - generic [ref=e255]: ET
              - generic [ref=e257]:
                - paragraph [ref=e258]: Emily Thompson
                - paragraph [ref=e259]: Freelance Writer
          - generic [ref=e261]:
            - paragraph [ref=e265]: "\"The most comprehensive text analysis platform I've used. All three tools work seamlessly together, saving us hours of manual verification work.\""
            - generic [ref=e277]:
              - generic [ref=e278]: DK
              - generic [ref=e280]:
                - paragraph [ref=e281]: Prof. David Kim
                - paragraph [ref=e282]: Research Director, MIT
          - generic [ref=e284]:
            - paragraph [ref=e288]: "\"ZeroPlagiarism gives us confidence in our content strategy. We can quickly verify authenticity and improve quality before publishing anything.\""
            - generic [ref=e300]:
              - generic [ref=e301]: LA
              - generic [ref=e303]:
                - paragraph [ref=e304]: Lisa Anderson
                - paragraph [ref=e305]: Marketing Director
          - generic [ref=e307]:
            - paragraph [ref=e311]: "\"Perfect for academic work. Helped me ensure my thesis was completely original and properly cited. The detailed reports are incredibly helpful.\""
            - generic [ref=e323]:
              - generic [ref=e324]: JW
              - generic [ref=e326]:
                - paragraph [ref=e327]: James Wilson
                - paragraph [ref=e328]: Graduate Student
        - generic [ref=e330]:
          - generic [ref=e331]:
            - generic [ref=e332]: 4.9★
            - generic [ref=e333]: Average Rating
          - generic [ref=e335]:
            - generic [ref=e336]: 50,000+
            - generic [ref=e337]: Happy Users
          - generic [ref=e339]:
            - generic [ref=e340]: 1M+
            - generic [ref=e341]: Texts Analyzed
      - generic [ref=e343]:
        - generic [ref=e344]:
          - heading "Security & Trust" [level=2] [ref=e345]
          - paragraph [ref=e346]: Your content and data are protected with enterprise-grade security and privacy standards.
        - generic [ref=e347]:
          - generic [ref=e348]:
            - heading "SOC 2 Compliant" [level=3] [ref=e352]
            - paragraph [ref=e353]: Enterprise-grade security standards
          - generic [ref=e354]:
            - heading "GDPR Compliant" [level=3] [ref=e359]
            - paragraph [ref=e360]: Your data privacy is protected
          - generic [ref=e361]:
            - heading "ISO 27001 Certified" [level=3] [ref=e366]
            - paragraph [ref=e367]: Information security management
          - generic [ref=e368]:
            - heading "Trusted Globally" [level=3] [ref=e375]
            - paragraph [ref=e376]: Used in 150+ countries
    - contentinfo [ref=e377]:
      - generic [ref=e378]:
        - generic [ref=e379]:
          - generic [ref=e380]:
            - generic [ref=e381]:
              - generic [ref=e382]: Z
              - generic [ref=e384]: ZeroPlagiarism
            - paragraph [ref=e385]: The complete solution for content authenticity. Detect AI text, humanize content, and check for plagiarism with enterprise-grade accuracy.
            - generic [ref=e386]:
              - link [ref=e387] [cursor=pointer]:
                - /url: "#"
              - link [ref=e390] [cursor=pointer]:
                - /url: "#"
              - link [ref=e393] [cursor=pointer]:
                - /url: "#"
              - link [ref=e398] [cursor=pointer]:
                - /url: "#"
          - generic [ref=e402]:
            - heading "Products" [level=3] [ref=e403]
            - list [ref=e404]:
              - listitem [ref=e405]:
                - link "AI Text Detection" [ref=e406] [cursor=pointer]:
                  - /url: /ai-detection
              - listitem [ref=e407]:
                - link "Text Humanizer" [ref=e408] [cursor=pointer]:
                  - /url: /humanizer
              - listitem [ref=e409]:
                - link "Plagiarism Checker" [ref=e410] [cursor=pointer]:
                  - /url: /plagiarism-checker
              - listitem [ref=e411]:
                - link "API Access" [ref=e412] [cursor=pointer]:
                  - /url: /api
          - generic [ref=e413]:
            - heading "Company" [level=3] [ref=e414]
            - list [ref=e415]:
              - listitem [ref=e416]:
                - link "About Us" [ref=e417] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e418]:
                - link "Careers" [ref=e419] [cursor=pointer]:
                  - /url: /careers
              - listitem [ref=e420]:
                - link "Blog" [ref=e421] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e422]:
                - link "Contact" [ref=e423] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e424]:
            - heading "Support" [level=3] [ref=e425]
            - list [ref=e426]:
              - listitem [ref=e427]:
                - link "Help Center" [ref=e428] [cursor=pointer]:
                  - /url: /help
              - listitem [ref=e429]:
                - link "Documentation" [ref=e430] [cursor=pointer]:
                  - /url: /documentation
              - listitem [ref=e431]:
                - link "Pricing" [ref=e432] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e433]:
                - link "Support" [ref=e434] [cursor=pointer]:
                  - /url: mailto:support@zeroplagiarism.com
        - generic [ref=e438]:
          - paragraph [ref=e439]: © 2024 ZeroPlagiarism. All rights reserved.
          - generic [ref=e440]:
            - link "Privacy Policy" [ref=e441] [cursor=pointer]:
              - /url: /privacy
            - link "Terms of Service" [ref=e442] [cursor=pointer]:
              - /url: /terms
            - link "Security" [ref=e443] [cursor=pointer]:
              - /url: /security
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Auth & routing', () => {
  4  |   test('homepage loads and shows branding', async ({ page }) => {
  5  |     await page.goto('/');
> 6  |     await expect(page.locator('text=ZeroPlagiarism')).toBeVisible();
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  7  |   });
  8  | 
  9  |   test('protected route redirects to sign-in when not authenticated', async ({ page }) => {
  10 |     await page.goto('/dashboard');
  11 |     await expect(page).toHaveURL(/\/sign-in/);
  12 |   });
  13 | 
  14 |   test('sign-in shows error on invalid credentials (mocked response)', async ({ page }) => {
  15 |     // Intercept the login API and return an invalid credentials response
  16 |     await page.route('http://localhost:8000/api/login/', async (route) => {
  17 |       await route.fulfill({
  18 |         status: 400,
  19 |         contentType: 'application/json',
  20 |         body: JSON.stringify({ error: 'Invalid credentials' }),
  21 |       });
  22 |     });
  23 | 
  24 |     await page.goto('/sign-in');
  25 |     await page.fill('input[type="email"]', 'noone@example.com');
  26 |     await page.fill('input[type="password"]', 'wrongpass');
  27 |     await page.click('button:has-text("Sign In")');
  28 | 
  29 |     // Ensure we stay on the sign-in page
  30 |     await expect(page).toHaveURL(/\/sign-in/);
  31 |     // Check for a visible error message (either the toast or the raw text)
  32 |     await expect(page.locator('text=Login Failed')).toBeVisible({ timeout: 3000 });
  33 |   });
  34 | });
  35 | 
```