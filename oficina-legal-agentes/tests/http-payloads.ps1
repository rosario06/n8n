# Test HTTP Payloads - Oficina Legal Automatizada

# Este script valida que todos los 8 workflows respondan correctamente
# Uso: .\http-payloads.ps1 -BaseUrl "http://localhost:5678" -Verbose

param(
    [Parameter(Mandatory = $true)]
    [string]$BaseUrl = "http://localhost:5678",
    
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== Test Suite: Oficina Legal Automatizada ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl`n"

# Global counters
$passed = 0
$failed = 0
$results = @()

function Test-Webhook {
    param(
        [string]$Name,
        [string]$Path,
        [hashtable]$Payload,
        [int]$ExpectedStatus = 200
    )
    
    $url = "$BaseUrl/$Path"
    $method = "POST"
    
    try {
        Write-Host "Testing: $Name" -ForegroundColor Yellow
        Write-Host "  Endpoint: $url"
        
        $response = Invoke-WebRequest -Uri $url `
            -Method $method `
            -Headers @{"Content-Type" = "application/json" } `
            -Body ($Payload | ConvertTo-Json -Depth 10) `
            -ErrorAction SilentlyContinue `
            -SkipHttpErrorCheck
        
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  ✅ Status: $statusCode (esperado)" -ForegroundColor Green
            $results += @{
                Name     = $Name
                Status   = "PASS"
                HttpCode = $statusCode
                Expected = $ExpectedStatus
            }
            $script:passed++
        }
        else {
            Write-Host "  ❌ Status: $statusCode (esperado $ExpectedStatus)" -ForegroundColor Red
            $results += @{
                Name     = $Name
                Status   = "FAIL"
                HttpCode = $statusCode
                Expected = $ExpectedStatus
            }
            $script:failed++
        }
        
        if ($Verbose -and $response.Content) {
            Write-Host "  Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            Name     = $Name
            Status   = "ERROR"
            HttpCode = $null
            Expected = $ExpectedStatus
            Error    = $_.Exception.Message
        }
        $script:failed++
    }
    
    Write-Host ""
}

# ============================================================================
# WF-01: Recepción omnicanal
# ============================================================================

Test-Webhook -Name "WF-01: Recepción omnicanal (mensaje WhatsApp)" `
    -Path "webhook/legal-recepcion" `
    -Payload @{
    channel   = "whatsapp"
    phone     = "+34612345678"
    message   = "Hola, necesito consultar sobre un contrato"
    timestamp = "$(Get-Date -Format 'yyyy-MM-dd\THH:mm:ss')"
} `
    -ExpectedStatus 200

Test-Webhook -Name "WF-01: Recepción omnicanal (email)" `
    -Path "webhook/legal-recepcion" `
    -Payload @{
    channel   = "email"
    email     = "cliente@example.com"
    subject   = "Consulta legal"
    body      = "Tengo una pregunta sobre derecho laboral"
    timestamp = "$(Get-Date -Format 'yyyy-MM-dd\THH:mm:ss')"
} `
    -ExpectedStatus 200

# ============================================================================
# WF-02: Intake legal
# ============================================================================

Test-Webhook -Name "WF-02: Intake legal (nuevo cliente)" `
    -Path "webhook/legal-intake" `
    -Payload @{
    full_name         = "Carlos García López"
    email             = "carlos.garcia@example.com"
    phone             = "+34612345678"
    case_type         = "laboral"
    description       = "Despido injustificado. Hice 5 años en la empresa"
    has_documentation = $true
    documents_urls    = @("file1.pdf", "file2.pdf")
} `
    -ExpectedStatus 200

# ============================================================================
# WF-03: Estado de caso
# ============================================================================

# Nota: Este test assume que existe client.id=1 y case.id=1 (creado en WF-02)
Test-Webhook -Name "WF-03: Estado de caso (por ID)" `
    -Path "webhook/legal-estado" `
    -Payload @{
    case_id   = 1
    timestamp = "$(Get-Date -Format 'yyyy-MM-dd\THH:mm:ss')"
} `
    -ExpectedStatus 200

Test-Webhook -Name "WF-03: Estado de caso (por contacto)" `
    -Path "webhook/legal-estado" `
    -Payload @{
    phone     = "+34612345678"
    timestamp = "$(Get-Date -Format 'yyyy-MM-dd\THH:mm:ss')"
} `
    -ExpectedStatus 200

# ============================================================================
# WF-04: Agenda y recordatorios
# ============================================================================

Test-Webhook -Name "WF-04: Agenda y recordatorios (crear cita)" `
    -Path "webhook/legal-agenda" `
    -Payload @{
    case_id          = 1
    appointment_type = "consulta"
    scheduled_at     = "$(Get-Date -AddDays 3 -Format 'yyyy-MM-dd\T14:00:00')"
    notes            = "Revisar documentación adicional"
    assigned_to      = "abogado_principal"
} `
    -ExpectedStatus 200

# ============================================================================
# WF-05: Escalado de urgencias
# ============================================================================

Test-Webhook -Name "WF-05: Escalado de urgencias (caso urgente)" `
    -Path "webhook/legal-urgencias" `
    -Payload @{
    case_id        = 1
    trigger_type   = "deadline_approaching"
    deadline_date  = "$(Get-Date -AddDays 1 -Format 'yyyy-MM-dd')"
    priority_level = "alta"
    description    = "Vence de plazo para contestación en 1 día"
} `
    -ExpectedStatus 200

# ============================================================================
# WF-06: Borradores asistidos
# ============================================================================

Test-Webhook -Name "WF-06: Borradores asistidos (generar demanda)" `
    -Path "webhook/legal-borradores" `
    -Payload @{
    case_id           = 1
    document_template = "demanda_laboral"
    client_name       = "Carlos García López"
    defendant         = "Empresa XYZ S.L."
    claims            = @("Salarios adeudados", "Daño moral")
    damages_amount    = 15000
} `
    -ExpectedStatus 200

# ============================================================================
# WF-07: Facturación y cobros
# ============================================================================

Test-Webhook -Name "WF-07: Facturación y cobros (crear factura)" `
    -Path "webhook/legal-facturacion" `
    -Payload @{
    case_id      = 1
    invoice_type = "horas_profesionales"
    hours        = 10
    rate         = 150
    description  = "Consulta inicial + revisión de documentos"
    due_days     = 30
} `
    -ExpectedStatus 200

# ============================================================================
# WF-08: Auditoría
# ============================================================================

Test-Webhook -Name "WF-08: Auditoría (registrar evento)" `
    -Path "webhook/legal-auditoria" `
    -Payload @{
    actor_type    = "usuario"
    actor_id      = "user_001"
    action        = "case_status_update"
    resource_type = "case"
    resource_id   = 1
    metadata      = @{
        old_status = "abierto"
        new_status = "en_negociacion"
        reason     = "Cliente aceptó propuesta de transacción"
    }
} `
    -ExpectedStatus 200

# ============================================================================
# Resultados
# ============================================================================

Write-Host "`n=== RESUMEN DE PRUEBAS ===" -ForegroundColor Cyan
Write-Host "Total: $($passed + $failed) pruebas"
Write-Host "✅ Pasadas: $passed" -ForegroundColor Green
Write-Host "❌ Fallidas: $failed" -ForegroundColor Red

if ($failed -gt 0) {
    Write-Host "`nDetalle de fallos:" -ForegroundColor Yellow
    $results | Where-Object { $_.Status -ne "PASS" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Status) (esperado $($_.Expected), recibido $($_.HttpCode))" -ForegroundColor Red
        if ($_.Error) {
            Write-Host "    Error: $($_.Error)" -ForegroundColor DarkRed
        }
    }
    exit 1
}
else {
    Write-Host "`n✅ ¡Todos los tests pasaron correctamente!" -ForegroundColor Green
    exit 0
}
