import React, { Component } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Alert, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeFeature: 'ai-detection',
            inputText: '',
            selectedFile: null,
            loading: false,
            apiResponse: null,
            error: null,
            pdfTaskId: null,
            pdfStatusUrl: null,
            pdfDownloadUrl: null,
            pdfPollingInterval: null,
        };

        this.fileInputRef = React.createRef();
        this.DJANGO_API_BASE_URL = 'http://localhost:8000/api';
    }

    componentWillUnmount() {
        if (this.state.pdfPollingInterval) {
            clearInterval(this.state.pdfPollingInterval);
        }
    }

    handleFeatureSelect = (feature) => {
        if (this.state.pdfPollingInterval) {
            clearInterval(this.state.pdfPollingInterval);
        }
        this.setState({
            activeFeature: feature,
            inputText: '',
            selectedFile: null,
            apiResponse: null,
            error: null,
            loading: false,
            pdfTaskId: null,
            pdfStatusUrl: null,
            pdfDownloadUrl: null,
            pdfPollingInterval: null,
        });
    };

    handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            this.setState({
                selectedFile: file,
                inputText: '',
                error: null,
            });
        }
        if (this.fileInputRef.current) {
            this.fileInputRef.current.value = '';
        }
    };

    triggerFileInput = () => {
        this.fileInputRef.current.click();
    };

    getApiEndpoint = () => {
        switch (this.state.activeFeature) {
            case 'ai-detection':
                return `${this.DJANGO_API_BASE_URL}/ai-check/`;
            case 'plagiarism-detection':
                return `${this.DJANGO_API_BASE_URL}/plagiarism-check/`;
            case 'humanize':
                return `${this.DJANGO_API_BASE_URL}/humanize/`;
            default:
                return '';
        }
    };

    pollPdfStatus = async (taskId, statusUrl) => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${this.DJANGO_API_BASE_URL}${statusUrl}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('PDF Status Polling:', data);

                if (data.status === 'completed') {
                    clearInterval(interval);
                    this.setState({
                        pdfPollingInterval: null,
                        pdfDownloadUrl: `${this.DJANGO_API_BASE_URL}${data.pdf_url}`,
                        loading: false,
                        apiResponse: data,
                    });
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    this.setState({
                        pdfPollingInterval: null,
                        loading: false,
                        error: `PDF generation failed: ${data.message || 'Unknown error.'}`,
                    });
                }
            } catch (err) {
                console.error('Error polling PDF status:', err);
                clearInterval(interval);
                this.setState({
                    pdfPollingInterval: null,
                    loading: false,
                    error: 'Failed to check PDF generation status.',
                });
            }
        }, 3000);
        this.setState({ pdfPollingInterval: interval });
    };

    handleSubmit = async () => {
        if (this.state.pdfPollingInterval) {
            clearInterval(this.state.pdfPollingInterval);
        }
        this.setState({
            loading: true,
            apiResponse: null,
            error: null,
            pdfTaskId: null,
            pdfStatusUrl: null,
            pdfDownloadUrl: null,
            pdfPollingInterval: null,
        });

        const endpoint = this.getApiEndpoint();
        let payload;
        let headers = {};

        if (this.state.selectedFile) {
            payload = new FormData();
            payload.append('file', this.state.selectedFile);
        } else if (this.state.inputText.trim()) {
            if (this.state.activeFeature === 'ai-detection' || this.state.activeFeature === 'plagiarism-detection') {
                payload = JSON.stringify({ text_content: this.state.inputText.trim() });
            } else if (this.state.activeFeature === 'humanize') {
                payload = JSON.stringify({ text: this.state.inputText.trim() });
            }
            headers['Content-Type'] = 'application/json';
        } else {
            this.setState({
                error: 'Please enter text or upload a file.',
                loading: false,
            });
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: payload,
            });

            if (response.status === 202) {
                const data = await response.json();
                this.setState({
                    pdfTaskId: data.task_id,
                    pdfStatusUrl: data.status_url,
                    apiResponse: { message: "Report generation started in background. Please wait...", task_id: data.task_id },
                }, () => {
                    this.pollPdfStatus(data.task_id, data.status_url);
                });
            } else if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'An unknown error occurred.');
            } else {
                const data = await response.json();
                this.setState({
                    apiResponse: data,
                    loading: false,
                });
            }
        } catch (err) {
            console.error('API call error:', err);
            this.setState({
                error: err.message || 'Failed to connect to the server or process request.',
                loading: false,
            });
        }
    };

    renderContent = () => {
        const { activeFeature, inputText, selectedFile, loading, error, apiResponse, pdfTaskId, pdfDownloadUrl } = this.state;
        let title = '';
        let placeholder = '';
        let actionButtonText = '';

        switch (activeFeature) {
            case 'ai-detection':
                title = 'AI Text Detection';
                placeholder = 'Paste your text here to check for AI-generated content...';
                actionButtonText = 'Detect AI';
                break;
            case 'plagiarism-detection':
                title = 'Plagiarism Detector';
                placeholder = 'Paste your text here to check for plagiarism...';
                actionButtonText = 'Check Plagiarism';
                break;
            case 'humanize':
                title = 'Humanize Text';
                placeholder = 'Paste your AI-generated text here to humanize it...';
                actionButtonText = 'Humanize';
                break;
            default:
                title = 'Select a Feature';
                placeholder = 'Choose a feature from the left panel.';
                actionButtonText = 'Process';
        }

        return (
            <Card className="h-100 shadow-lg">
                <Card.Body className="d-flex flex-column p-4">
                    <h2 className="h3 fw-bold text-dark mb-4 border-bottom pb-3">{title}</h2>

                    <Form.Group className="flex-grow-1 mb-4">
                        <Form.Control
                            as="textarea"
                            rows={8}
                            placeholder={placeholder}
                            value={inputText}
                            onChange={(e) => {
                                this.setState({
                                    inputText: e.target.value,
                                    selectedFile: null,
                                    error: null,
                                });
                            }}
                            className="mb-3"
                            style={{ resize: 'vertical' }}
                        />
                        <div className="d-flex align-items-center justify-content-between mt-3">
                            <span className="small text-muted">
                                {inputText.length} characters
                            </span>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="file"
                                    ref={this.fileInputRef}
                                    onChange={this.handleFileChange}
                                    className="d-none"
                                    accept=".docx,.pdf,.txt"
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={this.triggerFileInput}
                                    className="d-flex align-items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-paperclip me-2" viewBox="0 0 16 16">
                                        <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 0 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
                                    </svg>
                                    Upload File
                                </Button>
                                {selectedFile && (
                                    <span className="small text-success d-flex align-items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill me-1" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                        </svg>
                                        {selectedFile.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Form.Group>

                    <Button
                        variant="primary"
                        onClick={this.handleSubmit}
                        disabled={loading || (!inputText.trim() && !selectedFile)}
                        className="w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    >
                        {loading && (
                            <Spinner animation="border" size="sm" role="status" className="me-2">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        )}
                        <span>{loading ? 'Processing...' : actionButtonText}</span>
                    </Button>

                    {error && (
                        <Alert variant="danger" className="mt-4 rounded">
                            <Alert.Heading>Error!</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    )}

                    {apiResponse && (
                        <Card className="mt-4 shadow-sm">
                            <Card.Body>
                                <h3 className="h5 fw-semibold text-dark mb-3">Results:</h3>
                                {/* Plagiarism Detection (PDF generation status) */}
                                {activeFeature === 'plagiarism-detection' && pdfTaskId && !pdfDownloadUrl ? (
                                    <p className="text-info">
                                        PDF report is being generated in the background. Task ID: <span className="font-monospace small">{pdfTaskId}</span>.
                                        Please wait, it will download automatically once ready.
                                    </p>
                                ) : activeFeature === 'plagiarism-detection' && pdfDownloadUrl ? (
                                    <div className="d-flex flex-column align-items-center">
                                        <p className="text-success fw-semibold mb-3">PDF Report Ready!</p>
                                        <Button
                                            as="a"
                                            href={pdfDownloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="success"
                                            className="py-3 px-4 fw-bold d-flex align-items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V3.5a.5.5 0 0 0-1 0v6.793L4.354 8.146a.5.5 0 1 0-.708.708z"/>
                                            </svg>
                                            Download Report
                                        </Button>
                                        <p className="small text-muted mt-2">File: {apiResponse.filename || 'report.pdf'}</p>
                                    </div>
                                ) : activeFeature === 'ai-detection' && (apiResponse.ai_percentage !== undefined || apiResponse.ai_sentences_count !== undefined) ? (
                                    // AI Detection Results - UPDATED TO MATCH PROVIDED JSON
                                    <div>
                                        <p className="mb-2">
                                            <strong>AI Percentage:</strong>{' '}
                                            {apiResponse.ai_percentage !== undefined ? (
                                                <span className={`fw-bold ${apiResponse.ai_percentage > 0.5 ? 'text-danger' : 'text-success'}`}>
                                                    {Math.round(apiResponse.ai_percentage * 100)}% AI-generated
                                                </span>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </p>
                                        {apiResponse.ai_sentences_count !== undefined && (
                                            <p className="mb-2"><strong>AI Sentences Count:</strong> {apiResponse.ai_sentences_count}</p>
                                        )}
                                        {apiResponse.total_sentences !== undefined && (
                                            <p><strong>Total Sentences:</strong> {apiResponse.total_sentences}</p>
                                        )}

                                        {apiResponse.ai_sentences && Array.isArray(apiResponse.ai_sentences) && apiResponse.ai_sentences.length > 0 && (
                                            <div className="mt-3">
                                                <h5>Detected AI Sentences:</h5>
                                                <ul className="list-unstyled small">
                                                    {apiResponse.ai_sentences.map((sentence, index) => (
                                                        <li key={index} className="mb-1 text-danger">{sentence}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {apiResponse.borderline_sentences && Array.isArray(apiResponse.borderline_sentences) && apiResponse.borderline_sentences.length > 0 && (
                                            <div className="mt-3">
                                                <h5>Borderline Sentences:</h5>
                                                <ul className="list-unstyled small">
                                                    {apiResponse.borderline_sentences.map((sentence, index) => (
                                                        <li key={index} className="mb-1 text-warning">{sentence}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {apiResponse.sentence_predictions && Array.isArray(apiResponse.sentence_predictions) && apiResponse.sentence_predictions.length > 0 && (
                                            <div className="mt-3">
                                                <h5>Sentence-level Predictions:</h5>
                                                <ul className="list-unstyled small">
                                                    {apiResponse.sentence_predictions.map((prediction, index) => (
                                                        <li key={index} className="mb-2">
                                                            <strong>Sentence:</strong> {prediction.sentence}<br/>
                                                            <strong>Prediction:</strong> <span className={`fw-bold ${prediction.label === 'Human-Written' ? 'text-success' : 'text-danger'}`}>{prediction.label}</span> (AI Probability: {Math.round(prediction.ai_probability * 100)}%)
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : activeFeature === 'plagiarism-detection' && apiResponse.status === 'duplicate_content_found' ? (
                                    // Plagiarism Detection (direct JSON result from screenshot)
                                    <div>
                                        <p className="mb-2">
                                            <strong>Status:</strong> <span className="fw-bold text-danger">Duplicate content found!</span>
                                        </p>
                                        {apiResponse.duplicate_content_found_on_links && Array.isArray(apiResponse.duplicate_content_found_on_links) && apiResponse.duplicate_content_found_on_links.length > 0 && (
                                            <div className="mt-3">
                                                <h5>Found on Links:</h5>
                                                <ul className="list-unstyled small">
                                                    {apiResponse.duplicate_content_found_on_links.map((link, index) => (
                                                        <li key={index} className="mb-1">
                                                            <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {apiResponse.original_text && (
                                            <div className="mt-3">
                                                <h5>Original Text:</h5>
                                                <p className="text-muted small">{apiResponse.original_text}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : activeFeature === 'humanize' && apiResponse.modified_text ? (
                                    // Humanize Results
                                    <div>
                                        {apiResponse.original_text && (
                                            <p className="mb-2"><strong>Original Text:</strong> <span className="text-muted small">{apiResponse.original_text}</span></p>
                                        )}
                                        <p className="mb-2"><strong>Humanized Text:</strong></p>
                                        <p className="lead">{apiResponse.modified_text}</p>

                                        {apiResponse.ai_sentences_count !== undefined && (
                                            <p className="mb-2"><strong>AI Sentences Count (from original):</strong> {apiResponse.ai_sentences_count}</p>
                                        )}
                                        {apiResponse.total_sentences !== undefined && (
                                            <p className="mb-2"><strong>Total Sentences (from original):</strong> {apiResponse.total_sentences}</p>
                                        )}
                                        {apiResponse.original_ai_sentences && Array.isArray(apiResponse.original_ai_sentences) && apiResponse.original_ai_sentences.length > 0 && (
                                            <div className="mt-3">
                                                <h5>Original AI Sentences:</h5>
                                                <ul className="list-unstyled small">
                                                    {apiResponse.original_ai_sentences.map((sentence, index) => (
                                                        <li key={index} className="mb-1">{sentence}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {apiResponse.rewrites && Array.isArray(apiResponse.rewrites) && apiResponse.rewrites.length > 0 && (
                                            <div className="mt-3">
                                                <h5>Sentence Rewrites:</h5>
                                                <ul className="list-unstyled small">
                                                    {apiResponse.rewrites.map((item, index) => (
                                                        <li key={index} className="mb-1">
                                                            <strong>Original:</strong> {item.original}<br/>
                                                            <strong>Rewritten:</strong> {item.rewritten}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Fallback to raw JSON if structure is unexpected
                                    <pre className="small text-dark text-wrap">
                                        {JSON.stringify(apiResponse, null, 2)}
                                    </pre>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </Card.Body>
            </Card>
        );
    };

    render() {
        const { activeFeature } = this.state;

        return (
            <Container fluid className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-3 p-sm-4 p-lg-5">
                <style>
                    {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    body {
                        font-family: 'Inter', sans-serif;
                    }
                    .min-vh-70 {
                        min-height: 70vh;
                    }
                    .custom-gradient-bg {
                        background: linear-gradient(to bottom right, #2563eb, #6d28d9); /* blue-600 to purple-700 */
                    }
                    `}
                </style>
                <Card className="w-100 mw-100 shadow-lg overflow-hidden d-flex flex-column flex-lg-row min-vh-70">
                    <Col lg={3} className="p-4 custom-gradient-bg text-white d-flex flex-column gap-3 rounded-top rounded-lg-start rounded-lg-top-0 shadow">
                        <h1 className="h2 fw-extrabold mb-4 text-center">ZeroPlagiarism</h1>
                        <p className="lead text-opacity-75 mb-4 text-center">
                            More than an AI detector. Preserve <span className="fw-bold text-warning">what's human.</span>
                        </p>
                        <Button
                            variant={activeFeature === 'ai-detection' ? 'light' : 'primary'}
                            onClick={() => this.handleFeatureSelect('ai-detection')}
                            className={`w-100 py-3 rounded-lg fw-medium ${activeFeature === 'ai-detection' ? 'shadow-sm' : ''}`}
                        >
                            AI Text Detection
                        </Button>
                        <Button
                            variant={activeFeature === 'plagiarism-detection' ? 'light' : 'primary'}
                            onClick={() => this.handleFeatureSelect('plagiarism-detection')}
                            className={`w-100 py-3 rounded-lg fw-medium ${activeFeature === 'plagiarism-detection' ? 'shadow-sm' : ''}`}
                        >
                            Plagiarism Detector
                        </Button>
                        <Button
                            variant={activeFeature === 'humanize' ? 'light' : 'primary'}
                            onClick={() => this.handleFeatureSelect('humanize')}
                            className={`w-100 py-3 rounded-lg fw-medium ${activeFeature === 'humanize' ? 'shadow-sm' : ''}`}
                        >
                            Humanize Text
                        </Button>
                        <div className="mt-auto pt-4 small text-opacity-75 text-center">
                            <p>&copy; {new Date().getFullYear()} ZeroPlagiarism. All rights reserved.</p>
                        </div>
                    </Col>

                    <Col lg={9} className="p-4 bg-white d-flex flex-column justify-content-between">
                        {this.renderContent()}
                    </Col>
                </Card>
            </Container>
        );
    }
}

export default Dashboard;