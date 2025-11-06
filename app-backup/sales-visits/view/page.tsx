'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SalesVisit {
  id: string;
  visitDate: string;
  notes: string | null;
  images: string | null;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  createdAt: string;
}

export default function ViewSalesVisitsPage() {
  const [salesVisits, setSalesVisits] = useState<SalesVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<SalesVisit | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllSalesVisits();
  }, []);

  const fetchAllSalesVisits = async () => {
    try {
      const response = await fetch('/api/sales-visits');
      const data = await response.json();
      setSalesVisits(data);
    } catch (error) {
      console.error('Error fetching sales visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewVisitDetails = (visit: SalesVisit) => {
    setSelectedVisit(visit);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVisit(null);
  };

  const parseImages = (imagesJson: string | null): string[] => {
    if (!imagesJson) return [];
    try {
      return JSON.parse(imagesJson);
    } catch {
      return [];
    }
  };

  const generateVisitPDF = (visit: SalesVisit) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.text('Sales Visit Report', pageWidth / 2, 20, { align: 'center' });
    
    // Customer Info
    doc.setFontSize(14);
    doc.text('Customer Information', 14, 35);
    doc.setFontSize(11);
    doc.text(`Name: ${visit.customer.name}`, 14, 45);
    doc.text(`Email: ${visit.customer.email || 'N/A'}`, 14, 52);
    doc.text(`Phone: ${visit.customer.phone || 'N/A'}`, 14, 59);
    
    // Visit Details
    doc.setFontSize(14);
    doc.text('Visit Details', 14, 72);
    doc.setFontSize(11);
    doc.text(`Date & Time: ${new Date(visit.visitDate).toLocaleString()}`, 14, 82);
    
    // Visit Notes
    doc.setFontSize(14);
    doc.text('Visit Notes', 14, 95);
    doc.setFontSize(10);
    
    if (visit.notes && visit.notes.trim()) {
      const splitNotes = doc.splitTextToSize(visit.notes, pageWidth - 28);
      doc.text(splitNotes, 14, 105);
    } else {
      doc.text('No notes recorded', 14, 105);
    }
    
    // Photos section
    const notesHeight = visit.notes ? doc.splitTextToSize(visit.notes, pageWidth - 28).length * 5 : 5;
    const photosY = 105 + notesHeight + 10;
    
    doc.setFontSize(14);
    doc.text('Photos', 14, photosY);
    doc.setFontSize(10);
    
    const images = parseImages(visit.images);
    if (images.length > 0) {
      doc.text(`${images.length} photo(s) attached to this visit`, 14, photosY + 10);
      
      // Add images to PDF with orientation correction
      let currentY = photosY + 20;
      images.forEach((image, index) => {
        // Check if we need a new page
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        
        try {
          // Create a temporary image element to correct orientation
          const img = new Image();
          img.src = image;
          
          // Create canvas to redraw image without EXIF rotation
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw image on canvas (this strips EXIF data)
            ctx.drawImage(img, 0, 0);
            
            // Get corrected image data
            const correctedImage = canvas.toDataURL('image/jpeg', 0.8);
            
            const imgWidth = 80;
            const imgHeight = 60;
            doc.addImage(correctedImage, 'JPEG', 14, currentY, imgWidth, imgHeight);
            doc.setFontSize(9);
            doc.text(`Photo ${index + 1}`, 14, currentY + imgHeight + 5);
            currentY += imgHeight + 15;
          }
        } catch (error) {
          console.error('Error adding image to PDF:', error);
        }
      });
    } else {
      doc.text('No photos attached', 14, photosY + 10);
    }
    
    // Save the PDF
    const dateStr = new Date(visit.visitDate).toISOString().split('T')[0];
    doc.save(`Sales_Visit_${visit.customer.name.replace(/\s+/g, '_')}_${dateStr}.pdf`);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-400">Loading sales visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">View Sales Visits</h1>
        <div className="flex gap-4">
          <Link
            href="/sales-visits"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            + New Visit
          </Link>
          <Link
            href="/"
            className="text-gray-400 hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Sales Visits Table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">All Sales Visits ({salesVisits.length})</h2>

        {salesVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Customer</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Visit Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Notes Preview</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Photos</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {salesVisits.map((visit, index) => {
                  const imageCount = parseImages(visit.images).length;
                  const notesPreview = visit.notes
                    ? visit.notes.length > 100
                      ? visit.notes.substring(0, 100) + '...'
                      : visit.notes
                    : 'No notes';

                  return (
                    <tr key={visit.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-white font-medium">{visit.customer.name}</div>
                          <div className="text-xs text-gray-400">{visit.customer.email || 'No email'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-white">
                            {new Date(visit.visitDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(visit.visitDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm max-w-md">
                        {notesPreview}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {imageCount > 0 ? (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            📷 {imageCount}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => viewVisitDetails(visit)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No sales visits recorded yet.</p>
            <Link
              href="/sales-visits"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded inline-block"
            >
              Record Your First Visit
            </Link>
          </div>
        )}
      </div>

      {/* Modal for Visit Details */}
      {showModal && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Visit Details</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => generateVisitPDF(selectedVisit)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                  >
                    📄 Export PDF
                  </button>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400">Name</label>
                    <p className="text-white">{selectedVisit.customer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400">Email</label>
                    <p className="text-white">{selectedVisit.customer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400">Phone</label>
                    <p className="text-white">{selectedVisit.customer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400">Visit Date & Time</label>
                    <p className="text-white">
                      {new Date(selectedVisit.visitDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3">Visit Notes</h3>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {selectedVisit.notes || 'No notes recorded'}
                </p>
              </div>

              {/* Photos */}
              {parseImages(selectedVisit.images).length > 0 && (
                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold mb-3">Photos ({parseImages(selectedVisit.images).length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {parseImages(selectedVisit.images).map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Visit photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded border border-gray-700 cursor-pointer hover:opacity-80"
                          onClick={() => window.open(image, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Click on any image to view full size</p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}