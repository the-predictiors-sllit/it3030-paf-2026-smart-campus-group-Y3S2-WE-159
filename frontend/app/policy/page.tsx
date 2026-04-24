import MarkdownPreview from "@/components/custom/MarkdownPreview"



const policy = `
# Terms of Service & Privacy Policy: Smart Campus Operations Hub

**Effective Date:** April 23, 2026

Welcome to the Smart Campus Operations Hub. By accessing our platform to book campus resources, submit tickets, or interact with our AI assistance, you agree to the following terms.

---

## 1. Resource Booking & Usage
* **Eligibility:** Access is restricted to active students and staff with valid university credentials.
* **Booking Limits:** Users must adhere to specific time limits and frequency caps per resource (e.g., study rooms, labs).
* **Cancellations:** If a resource is no longer needed, users must cancel at least 1 hour in advance to allow others access.

## 2. Incident Reporting & Ticketing
* **Accuracy:** When submitting a ticket (maintenance, technical support, etc.), you agree to provide truthful and detailed information.
* **Priority:** Tickets are processed based on severity and order of receipt. The university reserves the right to prioritize urgent safety incidents.

## 3. AI-Powered Resource Search
Our platform utilizes an AI chat application powered by advanced language models to help you locate and book resources.
* **Automated Assistance:** The AI is designed to streamline discovery. While we strive for 100% accuracy, please verify booking details in the final confirmation screen.
* **Data Processing:** Queries sent to the AI chat are processed to improve search relevance. Do not share highly sensitive personal information (e.g., passwords) within the chat interface.

## 4. Privacy & Data Protection
We value your privacy. We collect and process the following data:
* **Identity Data:** Name and Email for authentication.
* **Usage Data:** Records of your bookings, ticket history.
* **Purpose:** Data is used solely for campus facility management and service optimization. We do not sell your data to third parties.

## 5. User Conduct
Users are prohibited from:
* Bypassing booking restrictions or "squatting" on resources.
* Submitting fraudulent tickets or spamming the AI search tool.
* Attempting to reverse-engineer the AI logic or backend API endpoints.

## 6. Limitation of Liability
The Smart Campus Operations Hub is provided "as-is." While we aim for 24/7 uptime, the university is not liable for technical glitches that may result in double-bookings or delayed ticket responses.

---
*For questions regarding this policy, please contact the Campus IT Operations Department.*
`;

const page = () => {

  return (
    <div className="p-3">

    <MarkdownPreview content={policy} />
    </div>
  )
}

export default page