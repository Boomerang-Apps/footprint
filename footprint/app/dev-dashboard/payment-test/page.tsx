'use client';

import { useState } from 'react';
import { PaymentModal } from '@/components/checkout/PaymentModal';

/**
 * Dev-only test page for the PayPlus payment iframe modal.
 * Visit: http://localhost:3000/dev-dashboard/payment-test
 *
 * Tests:
 * 1. Modal opens with iframe loading state
 * 2. Close button shows confirmation dialog
 * 3. ESC key triggers close confirmation
 * 4. postMessage from iframe-callback bridge triggers success/failure
 *
 * The "Simulate Success" / "Simulate Failure" buttons mimic what the
 * iframe-callback bridge page does via postMessage.
 */
export default function PaymentTestPage() {
  const [showModal, setShowModal] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [iframeSrc, setIframeSrc] = useState<'bridge' | 'external'>('bridge');

  const addLog = (msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  // Use our own bridge page as a test iframe source (loads fast, same origin)
  const bridgeTestUrl = '/payment/iframe-callback?status=pending';
  // Use an external URL to test the real iframe look
  const externalTestUrl = 'https://example.com';

  const paymentUrl = iframeSrc === 'bridge' ? bridgeTestUrl : externalTestUrl;

  const simulateMessage = (success: boolean) => {
    window.postMessage(
      {
        type: 'PAYPLUS_PAYMENT_RESULT',
        success,
        pageRequestUid: success ? 'test-uid-' + Date.now() : '',
      },
      window.location.origin
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Payment Modal Test</h1>
      <p className="text-gray-500 mb-6">
        Test the PayPlus iframe payment modal without real credentials.
      </p>

      {/* Controls */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">
            iframe source
          </label>
          <select
            value={iframeSrc}
            onChange={(e) => setIframeSrc(e.target.value as 'bridge' | 'external')}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="bridge">Bridge page (same origin)</option>
            <option value="external">External page (example.com)</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowModal(true);
              addLog('Modal opened');
            }}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium"
          >
            Open Payment Modal
          </button>

          <button
            onClick={() => {
              simulateMessage(true);
              addLog('Simulated SUCCESS postMessage');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Simulate Success
          </button>

          <button
            onClick={() => {
              simulateMessage(false);
              addLog('Simulated FAILURE postMessage');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Simulate Failure
          </button>
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto">
        <div className="text-gray-500 mb-2">Event Log</div>
        {log.length === 0 ? (
          <div className="text-gray-600">No events yet. Open the modal to start testing.</div>
        ) : (
          log.map((entry, i) => <div key={i}>{entry}</div>)
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PaymentModal
          paymentUrl={paymentUrl}
          onSuccess={(uid) => {
            addLog(`onSuccess called with pageRequestUid: ${uid}`);
            setShowModal(false);
          }}
          onFailure={(error) => {
            addLog(`onFailure called: ${error}`);
            setShowModal(false);
          }}
          onClose={() => {
            addLog('onClose called (user cancelled)');
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
