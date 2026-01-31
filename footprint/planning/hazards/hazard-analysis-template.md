# Hazard Analysis Template

## Story: {STORY-ID}

### Identified Hazards

| ID | Description | Severity | Likelihood | Risk Level | Mitigation |
|----|-------------|----------|------------|------------|------------|
| HAZ-001 | Example hazard | Major | Occasional | Medium | Mitigation strategy |

### Severity Levels
- **Catastrophic**: System failure, data loss, security breach
- **Critical**: Major functionality broken, significant user impact
- **Major**: Feature degradation, workaround available
- **Minor**: Cosmetic issues, minimal user impact

### Likelihood Levels
- **Frequent**: Expected to occur often
- **Probable**: Will occur several times
- **Occasional**: Likely to occur sometime
- **Remote**: Unlikely but possible
- **Improbable**: So unlikely it can be assumed it won't occur

### Risk Matrix

|              | Improbable | Remote | Occasional | Probable | Frequent |
|--------------|------------|--------|------------|----------|----------|
| Catastrophic | Medium     | High   | Critical   | Critical | Critical |
| Critical     | Low        | Medium | High       | Critical | Critical |
| Major        | Low        | Low    | Medium     | High     | High     |
| Minor        | Low        | Low    | Low        | Medium   | Medium   |

### Rollback Procedure

1. **Trigger**: Describe when rollback should be initiated
2. **Steps**:
   - Step 1
   - Step 2
   - Step 3
3. **Verification**: How to verify rollback was successful
4. **Communication**: Who to notify
