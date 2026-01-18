# Testing Guide

This guide provides sample queries and expected behaviors for testing the Mini RAG application.

## Initial Setup Testing

### 1. Check Application Loads
- Navigate to http://localhost:3000
- Verify no console errors
- Confirm UI displays correctly
- Check that "Documents in database: 0" shows

### 2. Upload Test Documents

Upload each document from `sample-docs/` one by one:

```
Files to upload:
- ai-basics.txt
- climate-change.txt
- quantum-computing.txt
- space-exploration.txt
- blockchain.txt
- cybersecurity.txt
- renewable-energy.txt
- gene-editing.txt
- metaverse.txt
- mental-health.txt
- electric-vehicles.txt
- sustainable-food.txt
```

Expected behavior:
- Success message appears
- Stats show: chunks created, tokens, cost, processing time
- Document count increases

## Query Testing

### Easy Queries (Direct Match)

**Query 1: "What is machine learning?"**
- Expected: Answer about ML from ai-basics.txt
- Citations: Should reference AI document
- Response time: < 2s

**Query 2: "What causes climate change?"**
- Expected: Answer about greenhouse gases and CO2
- Citations: Should reference climate-change.txt
- Response time: < 2s

**Query 3: "How does CRISPR work?"**
- Expected: Answer about guide RNA and Cas9 enzyme
- Citations: Should reference gene-editing.txt
- Response time: < 2s

### Medium Queries (Requires Understanding)

**Query 4: "What are the challenges of renewable energy?"**
- Expected: Discussion of storage, grid infrastructure
- Citations: Should reference renewable-energy.txt
- Should mention variable nature of renewables

**Query 5: "What is quantum supremacy?"**
- Expected: Explanation of quantum computers solving problems faster
- Citations: Should reference quantum-computing.txt
- May mention Google, IBM achievements

**Query 6: "What are the security implications of AI?"**
- Expected: Answer about AI in cybersecurity, both defensive and offensive uses
- Citations: Should reference cybersecurity.txt and possibly ai-basics.txt
- Multi-source response expected

### Hard Queries (Cross-Document Reasoning)

**Query 7: "How can technology help with climate change?"**
- Expected: Multiple technologies - renewable energy, EVs, AI optimization
- Citations: Should reference climate-change.txt, renewable-energy.txt, electric-vehicles.txt
- Answer should synthesize multiple sources

**Query 8: "What are the ethical concerns with emerging technologies?"**
- Expected: Mentions gene editing, AI, privacy
- Citations: Multiple sources (gene-editing.txt, ai-basics.txt, cybersecurity.txt)
- Comprehensive answer

**Query 9: "What role does energy play in future technologies?"**
- Expected: Discussion of EVs, quantum computing cooling, data centers
- Citations: Multiple relevant sources
- Synthesis required

### Edge Cases

**Query 10: "What is the meaning of life?"**
- Expected: "No relevant documents found" or "insufficient information"
- Should not hallucinate an answer
- May return empty or minimal response

**Query 11: "Tell me about dinosaurs"**
- Expected: No relevant information found
- Should indicate documents don't contain this topic
- No hallucination

## Performance Expectations

### Timing Benchmarks
- Retrieval: 100-300ms
- Reranking: 200-500ms
- LLM: 500-1500ms
- Total: < 2500ms typical

### Cost Estimates
- Per query: $0.001-0.002
- Per upload (1000 words): ~$0.0001

## Citation Verification

For each answer, verify:
1. Citations appear as [1], [2], etc. in the answer
2. Source cards display below answer
3. Each citation includes:
   - Index number
   - Content snippet
   - Source filename
   - Chunk position
   - Rerank score

## Error Handling Tests

### Test 1: Empty Upload
- Leave text field empty
- Try to submit
- Expected: Form validation prevents submission

### Test 2: Query Before Upload
- Don't upload any documents
- Submit a query
- Expected: Message indicating no documents available

### Test 3: Very Long Query
- Submit a query with 500+ words
- Expected: Still works, may take slightly longer

### Test 4: Special Characters
- Upload text with special chars: @#$%^&*
- Query with special chars
- Expected: Works correctly, no crashes

## UI/UX Checks

1. Responsive design works on mobile
2. Loading states show during processing
3. Error messages are clear and helpful
4. Success messages include relevant stats
5. Citations are clearly formatted
6. Timing/cost info displays prominently

## Production Checklist

Before deploying:
- [ ] No console errors on production build
- [ ] All environment variables set
- [ ] Supabase schema applied
- [ ] Test at least 3 successful uploads
- [ ] Test at least 5 successful queries
- [ ] Verify citations display correctly
- [ ] Check mobile responsiveness
- [ ] Verify timing metrics work
- [ ] Test with multiple document types
- [ ] Ensure no API keys in client code

## Common Issues & Solutions

**Issue: "Missing environment variable"**
- Solution: Check .env file exists and has all required variables

**Issue: Vector search returns no results**
- Solution: Verify documents were uploaded successfully, check Supabase table

**Issue: Slow queries (>5s)**
- Solution: Check API keys are valid, verify network connection, check API rate limits

**Issue: Citations not displaying**
- Solution: Check reranker is working, verify citation index mapping

**Issue: High costs**
- Solution: Review chunk sizes, consider using smaller models, implement caching
