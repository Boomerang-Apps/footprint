# Safety Protocol

## High-Risk Operations

The following operations require extra caution:

- **Database migrations** - Always backup before schema changes
- **Payment processing** - Never store raw card data
- **User authentication changes** - Test thoroughly in staging
- **File system operations** - Validate all paths

## Approval Requirements

### Requires CTO/Lead Approval
- Database schema changes in production
- Authentication system modifications
- Third-party API integrations
- Infrastructure changes

### Requires Code Review
- All production deployments
- Security-sensitive code
- Performance-critical paths

## Forbidden Operations

**Never do the following without explicit approval:**

- ❌ Direct production database access
- ❌ Bypassing authentication or authorization
- ❌ Hardcoding credentials or secrets
- ❌ Disabling security middleware
- ❌ Force pushing to main/master branch
- ❌ Deleting user data without backup

## Incident Response

1. **Detect** - Monitor alerts and user reports
2. **Assess** - Determine severity and scope
3. **Contain** - Limit damage
4. **Notify** - Alert stakeholders
5. **Fix** - Implement solution
6. **Review** - Post-mortem analysis

## Security Best Practices

- Use environment variables for secrets
- Validate all user input
- Sanitize data before database queries
- Implement rate limiting
- Use HTTPS everywhere
- Keep dependencies updated
