'use client'
import React, { useState } from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import MarkdownPreview from '@/components/custom/Sub_components/MarkdownPreview';
import { Separator } from "@/components/ui/separator"
import { useParams } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton"




const title = "Smart Campus: Incident Report"
const ReferenceId = "12222"
const datetime = "2026-03-21 11:00:00.000"
const description = `

> **Status:** High Priority | **Assigned to:** Maintenance Team

This report contains a summary of the hardware failure in the **Computing Lab (Block B)**. Please review the details below before dispatching a technician.

---

## 1. Description of Issue
A short-circuit occurred in the primary server rack. This has affected the following systems:
* **Student Wi-Fi** (SSID: *SLIIT-Student*)
* **MinIO Storage Service**
* **Local Database Mirroring**

### Reproduction Steps
1. Navigate to the \`Server Management\` panel.
2. Attempt to ping the gateway \`192.168.1.1\`.
3. Check the **Log Output** for power surge warnings.

---

## 2. Technical Logs
The system captured the following error in the \`FastAPI\` backend:

\`\`\`python
@app.get("/system/status")
def get_status():
    # Simulated hardware check
    if power_level < 0.5:
        raise HTTPException(status_code=500, detail="Voltage Drop Detected")
    return {"status": "Stable"}
\`\`\`

---

## 3. Impact Assessment
The following table shows the estimated downtime for university services:

| Service Name | Priority | Estimated Recovery |
| :--- | :---: | :--- |
| **LMS Dashboard** | Critical | 2 Hours |
| **Library Catalog** | Medium | 5 Hours |
| **Cafeteria POS** | Low | Next Business Day |

---

## 4. Required Hardware
To fix the issue, the technician must bring:
1. [x] Cat6 Ethernet Cables
2. [x] Replacement PSU (650W)
3. [ ] Thermal Paste
4. [ ] Multimeter

---

## 5. Helpful Resources
For more information, visit the [Internal Wiki](https://nextjs.org/docs) or contact the **Data Science Department**.

> **Note:** If the "smoke" emoji (💨) was observed, do not attempt to restart the machine manually. 

---

### Implementation Tip
When you pass this string into your component, ensure your \`div\` looks like this to handle the tables and bold text correctly:

\`\`\`tsx
<div className="prose prose-slate dark:prose-invert max-w-none">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {markdownString}
  </ReactMarkdown>
</div>
\`\`\`

**Why this works for your project:**
* **Tables:** Uses \`remarkGfm\` to render the Impact Assessment properly.
* **Code Blocks:** Demonstrates the syntax highlighting your SLM (Small Language Model) projects might need.
* **Checklists:** Useful for the "Smart Campus" task management features.`;



const page = () => {
    const [loading, setLoading] = useState(false)
    const params = useParams();
    const id = params.id as string;
    if (loading) {
        return (
            <div className=' m-5'>
                <Card className=' shadow-lg'>
                    <CardHeader>
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <Separator />
                    <CardContent>
                        <Skeleton className="aspect-video w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }
    return (
        <div className=' m-5'>
            <Card className=' shadow-lg'>
                <CardHeader>
                    <CardTitle className=' text-2xl font-bold mb-2'>{title}</CardTitle>
                    <p className=' opacity-50 text-sm'>Reference Id - {ReferenceId} </p>
                    <p className=' opacity-50 text-sm'>Created at - {datetime} </p>
                </CardHeader>
                <Separator />
                <CardContent>
                    <MarkdownPreview content={description} />
                </CardContent>
            </Card>
        </div>
    )
}

export default page

