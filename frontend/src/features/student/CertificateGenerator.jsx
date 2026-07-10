import React, { useState } from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import "./certificate.css";

export default function CertificateGenerator({ studentName, assessmentTitle, date }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Fetch the official logo from the public folder and convert to base64
      const logoRes = await fetch('/brand/Logo-White.png');
      const logoBlob = await logoRes.blob();
      const logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });

      // Get natural dimensions to prevent squishing
      const img = new Image();
      img.src = logoBase64;
      await new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; 
      });
      
      let targetWidth = 18;
      let targetHeight = 8;
      
      if (img.width && img.height) {
          const aspectRatio = img.width / img.height;
          // Fit inside a 22x22 box so it looks great inside the circle
          if (aspectRatio > 1) {
              targetWidth = 20;
              targetHeight = 20 / aspectRatio;
          } else {
              targetHeight = 20;
              targetWidth = 20 * aspectRatio;
          }
      }

      // 100% NATIVE PDF GENERATION - Bypasses all browser text-squishing bugs!
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [224, 210] // width, height
      });

      // Outer Border
      doc.setDrawColor(94, 23, 79); // #5e174f
      doc.setLineWidth(0.5);
      doc.rect(10, 10, 204, 190);
      
      // Teal Brackets
      doc.setDrawColor(0, 179, 166); // #00b3a6
      doc.setLineWidth(2);
      // Top Left
      doc.line(8, 8, 20, 8);
      doc.line(8, 8, 8, 20);
      // Top Right
      doc.line(216, 8, 204, 8);
      doc.line(216, 8, 216, 20);
      // Bottom Left
      doc.line(8, 202, 20, 202);
      doc.line(8, 202, 8, 190);
      // Bottom Right
      doc.line(216, 202, 204, 202);
      doc.line(216, 202, 216, 190);

      // Logo Circle
      doc.setFillColor(94, 23, 79);
      doc.circle(112, 35, 12, 'F'); 
      const x = 112 - (targetWidth / 2);
      const y = 35 - (targetHeight / 2);
      doc.addImage(logoBase64, "PNG", x, y, targetWidth, targetHeight);

      // Title
      doc.setTextColor(94, 23, 79);
      doc.setFont("times", "italic");
      doc.setFontSize(28);
      doc.text("Certificate of Completion", 112, 65, { align: "center" });

      // Subtitle
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("RECOGNITION OF ACADEMIC EXCELLENCE", 112, 75, { align: "center" });

      // Certify
      doc.setTextColor(50, 50, 50);
      doc.setFont("times", "italic");
      doc.setFontSize(12);
      doc.text("This is to certify that", 112, 90, { align: "center" });

      // Name
      doc.setTextColor(94, 23, 79);
      doc.setFont("times", "bold");
      doc.setFontSize(24);
      doc.text(studentName, 112, 105, { align: "center" });

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(62, 110, 162, 110);

      // Text
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("has successfully completed the assessment", 112, 120, { align: "center" });

      // Assessment
      doc.setTextColor(0, 179, 166);
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(assessmentTitle, 112, 130, { align: "center" });

      // Date
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`on the date of ${date}`, 112, 140, { align: "center" });

      // --- Signatures ---
      // Anand Sahay
      doc.setFont("times", "italic");
      doc.setFontSize(14);
      doc.text("Anand Sahay", 40, 165, { align: "center" });
      doc.setDrawColor(150, 150, 150);
      doc.line(20, 168, 60, 168);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Anand Sahay", 40, 173, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text("CEO & ACADEMY DIRECTOR", 40, 177, { align: "center" });

      // Marco van Hout
      doc.setTextColor(80, 80, 80);
      doc.setFont("times", "italic");
      doc.setFontSize(14);
      doc.text("Marco van Hout", 184, 165, { align: "center" });
      doc.setDrawColor(150, 150, 150);
      doc.line(164, 168, 204, 168);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Marco van Hout", 184, 173, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text("GLOBAL LEAD INSTRUCTOR", 184, 177, { align: "center" });

      // --- Verified Badge ---
      doc.setDrawColor(0, 179, 166);
      doc.setLineWidth(0.8);
      doc.roundedRect(97, 155, 30, 25, 2, 2);
      
      // Inner dashed rect
      if (typeof doc.setLineDash === 'function') {
        doc.setLineDash([1, 1], 0);
      }
      doc.setLineWidth(0.3);
      doc.roundedRect(99, 157, 26, 17, 1, 1);
      if (typeof doc.setLineDash === 'function') {
        doc.setLineDash([], 0); // reset
      }

      doc.setTextColor(0, 179, 166);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(4);
      doc.text("XEBIA AUTHENTICATED", 112, 164, { align: "center" });
      doc.text("EXCELLENCE", 112, 167, { align: "center" });

      doc.setFillColor(0, 179, 166);
      doc.rect(97, 175, 30, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text("VERIFIED", 112, 178.5, { align: "center" });

      // --- Meta Footer ---
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(5);
      doc.text("Certificate ID: XB-2024-CERT", 70, 195, { align: "center" });
      doc.text("Verification: training.xebia.com/verify", 154, 195, { align: "center" });

      doc.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button 
        className="secondary student-submit-button" 
        onClick={generatePDF} 
        disabled={isGenerating}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', width: 'auto' }}
      >
        <Download size={18} />
        {isGenerating ? "Generating..." : "Download Certificate (PDF)"}
      </button>

      <div className="certificate-wrapper">
        <div className="cert-border-outer">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
          
          <div className="cert-logo-circle">
            <img src="/brand/Logo-White.png" alt="Xebia" style={{ width: '45px', height: 'auto' }} />
          </div>
          
          <h1 className="cert-title">Certificate of Completion</h1>
          <p className="cert-subtitle">RECOGNITION OF ACADEMIC EXCELLENCE</p>
          
          <p className="cert-certify">This is to certify that</p>
          <h2 className="cert-name">{studentName}</h2>
          <div className="cert-divider"></div>
          <p className="cert-text">has successfully completed the assessment</p>
          <h3 className="cert-assessment">{assessmentTitle}</h3>
          <p className="cert-date-text">on the date of <strong>{date}</strong></p>
          
          <div className="cert-footer">
            <div className="cert-signature">
              <div className="sig-cursive">[Signature]</div>
              <div className="sig-line"></div>
              <div className="sig-name">Anand Sahay</div>
              <div className="sig-title">CEO & ACADEMY DIRECTOR</div>
            </div>
            
            <div className="cert-verified-badge">
              <div className="badge-inner">
                <p>XEBIA AUTHENTICATED</p>
                <p>EXCELLENCE</p>
              </div>
              <div className="badge-bottom">VERIFIED</div>
            </div>
            
            <div className="cert-signature">
              <div className="sig-cursive">[Signature]</div>
              <div className="sig-line"></div>
              <div className="sig-name">Marco van Hout</div>
              <div className="sig-title">GLOBAL LEAD INSTRUCTOR</div>
            </div>
          </div>
          
          <div className="cert-bottom-meta">
            <span>Certificate ID: XB-2024-[ID]-CERT</span>
            <span>Verification: training.xebia.com/verify</span>
          </div>
        </div>
      </div>
    </>
  );
}
