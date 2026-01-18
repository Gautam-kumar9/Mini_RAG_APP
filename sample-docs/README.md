# Sample Documents for Testing

This folder contains 12 sample text documents covering various topics for testing the RAG application.

## Documents Included

1. **ai-basics.txt** - Introduction to Artificial Intelligence and Machine Learning
2. **climate-change.txt** - Climate change causes, effects, and solutions
3. **quantum-computing.txt** - Quantum computing technology and applications
4. **space-exploration.txt** - History and future of space exploration
5. **blockchain.txt** - Blockchain technology and applications
6. **cybersecurity.txt** - Cybersecurity threats and defense strategies
7. **renewable-energy.txt** - Renewable energy sources and challenges
8. **gene-editing.txt** - CRISPR and gene editing technologies
9. **metaverse.txt** - The metaverse and virtual worlds
10. **mental-health.txt** - Mental health awareness and treatment
11. **electric-vehicles.txt** - Electric vehicles and transportation
12. **sustainable-food.txt** - Sustainable food systems and agriculture

## Usage

### Upload via UI
1. Open the application at http://localhost:3000
2. Copy the content of any file
3. Paste into the "Document Text" field
4. Enter the filename in "Source Name" field
5. Optionally add a title
6. Click "Upload & Process"

### Sample Queries by Document

**AI Basics:**
- "What is machine learning?"
- "How do neural networks work?"
- "What are transformer architectures?"

**Climate Change:**
- "What causes climate change?"
- "What are the effects of rising temperatures?"
- "How can we reduce greenhouse gas emissions?"

**Quantum Computing:**
- "What is a qubit?"
- "What is quantum supremacy?"
- "What are the challenges of quantum computing?"

**Space Exploration:**
- "When did humans first walk on the moon?"
- "What is the Artemis program?"
- "What has the Hubble telescope discovered?"

**Blockchain:**
- "How does blockchain work?"
- "What are smart contracts?"
- "What are the challenges of blockchain adoption?"

**Cybersecurity:**
- "What is zero-trust architecture?"
- "How does AI help with cybersecurity?"
- "What are common cyber threats?"

**Renewable Energy:**
- "What are the main types of renewable energy?"
- "What is the challenge with renewable energy storage?"
- "How does solar power work?"

**Gene Editing:**
- "What is CRISPR?"
- "What are the medical applications of gene editing?"
- "What are the ethical concerns with CRISPR?"

**Metaverse:**
- "What is the metaverse?"
- "What technologies enable the metaverse?"
- "What are metaverse applications?"

**Mental Health:**
- "What are common mental health treatments?"
- "How are digital tools used for mental health?"
- "What are barriers to mental health care?"

**Electric Vehicles:**
- "What are the benefits of electric vehicles?"
- "What is the main challenge with EV batteries?"
- "How does EV charging infrastructure work?"

**Sustainable Food:**
- "What is vertical farming?"
- "What are alternative protein sources?"
- "How can we reduce food waste?"

## Cross-Document Queries

These queries should pull information from multiple documents:

1. "How can technology help fight climate change?"
   - Should reference: climate-change.txt, renewable-energy.txt, electric-vehicles.txt

2. "What are the ethical concerns with emerging technologies?"
   - Should reference: gene-editing.txt, ai-basics.txt, blockchain.txt

3. "What role does energy play in future technologies?"
   - Should reference: quantum-computing.txt, electric-vehicles.txt, renewable-energy.txt

4. "How is AI being used across different fields?"
   - Should reference: ai-basics.txt, cybersecurity.txt, mental-health.txt

## Document Statistics

Each document contains approximately:
- **Words:** 250-400 per document
- **Tokens:** 300-500 per document
- **Chunks:** 1-2 chunks per document (with overlap)

## Testing Workflow

### Basic Test
1. Upload 1-2 documents
2. Ask simple questions about content
3. Verify citations appear correctly

### Comprehensive Test
1. Upload all 12 documents
2. Ask both simple and complex queries
3. Test cross-document reasoning
4. Verify performance metrics

### Performance Test
1. Upload all documents in sequence
2. Note processing time for each
3. Run multiple queries
4. Check timing and cost estimates

## Adding Your Own Documents

You can add your own text files to test:

1. Create a new .txt file
2. Add meaningful content (200-1000 words recommended)
3. Upload via the UI
4. Ask relevant questions

**Tips for good test documents:**
- Clear, focused topics
- Well-structured paragraphs
- Factual information
- 300-800 words optimal
- Avoid excessive formatting

## Batch Upload Script

To upload all documents programmatically, see API_EXAMPLES.md for batch upload scripts in JavaScript and Python.

## Expected Behavior

After uploading documents, you should see:
- Success message with chunk count
- Token usage estimate
- Processing time
- Updated document count

When querying:
- Answer with inline citations [1][2]
- Source cards below answer
- Timing breakdown (retrieval, rerank, LLM)
- Cost estimates
- Rerank scores for each source
