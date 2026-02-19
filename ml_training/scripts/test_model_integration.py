"""
Script kiểm tra tích hợp model AI
Sử dụng để validate output của model có đúng schema không
"""

import json
import sys
from pathlib import Path

def validate_clinical_output(output_data):
    """Validate clinical assessment output"""
    required_fields = [
        'session_id', 'report_type', 'timestamp',
        'dominant_emotion', 'emotional_changes',
        'data_driven_analysis', 'case_formulation',
        'risk_assessment', 'clinical_plan', 'summary'
    ]
    
    errors = []
    
    # Check required fields
    for field in required_fields:
        if field not in output_data:
            errors.append(f"Missing required field: {field}")
    
    if errors:
        return False, errors
    
    # Validate data_driven_analysis
    if 'dominant_emotion' not in output_data['data_driven_analysis']:
        errors.append("Missing data_driven_analysis.dominant_emotion")
    
    # Validate case_formulation
    cf = output_data.get('case_formulation', {})
    if not cf.get('precipitants') or len(cf.get('precipitants', [])) == 0:
        errors.append("case_formulation.precipitants must have at least 1 item")
    if not cf.get('automatic_thoughts') or len(cf.get('automatic_thoughts', [])) == 0:
        errors.append("case_formulation.automatic_thoughts must have at least 1 item")
    if not cf.get('maladaptive_behaviors') or len(cf.get('maladaptive_behaviors', [])) == 0:
        errors.append("case_formulation.maladaptive_behaviors must have at least 1 item")
    
    # Validate risk_assessment
    ra = output_data.get('risk_assessment', {})
    if 'suicidal_ideation' not in ra or not isinstance(ra['suicidal_ideation'], bool):
        errors.append("risk_assessment.suicidal_ideation must be boolean")
    if ra.get('severity_level') not in ['low', 'moderate', 'high', 'critical']:
        errors.append("risk_assessment.severity_level must be one of: low, moderate, high, critical")
    
    # Validate clinical_plan
    cp = output_data.get('clinical_plan', {})
    if not cp.get('next_steps') or len(cp.get('next_steps', [])) == 0:
        errors.append("clinical_plan.next_steps must have at least 1 item")
    
    # Validate summary
    summary = output_data.get('summary', '')
    if len(summary) < 50:
        errors.append("summary must be at least 50 characters")
    if len(summary) > 1000:
        errors.append("summary must be at most 1000 characters")
    
    if errors:
        return False, errors
    
    return True, []


def validate_dashboard_output(output_data):
    """Validate dashboard analytics output"""
    required_fields = [
        'session_id', 'report_type', 'timestamp',
        'session_analysis', 'emotional_progression',
        'triggers', 'risk_indicators', 'trend', 'simple_summary'
    ]
    
    errors = []
    
    # Check required fields
    for field in required_fields:
        if field not in output_data:
            errors.append(f"Missing required field: {field}")
    
    if errors:
        return False, errors
    
    # Validate session_analysis
    sa = output_data.get('session_analysis', {})
    if 'dominant_emotion' not in sa:
        errors.append("Missing session_analysis.dominant_emotion")
    if 'emotional_breakdown' not in sa:
        errors.append("Missing session_analysis.emotional_breakdown")
    else:
        # Check emotional_breakdown sum = 1.0
        breakdown = sa['emotional_breakdown']
        total = sum(breakdown.values())
        if abs(total - 1.0) > 0.01:  # Allow small floating point error
            errors.append(f"emotional_breakdown values must sum to 1.0, got {total}")
    
    if 'overall_sentiment' in sa:
        sentiment = sa['overall_sentiment']
        if sentiment < -1.0 or sentiment > 1.0:
            errors.append(f"overall_sentiment must be between -1.0 and 1.0, got {sentiment}")
    
    if 'intensity_average' in sa:
        intensity = sa['intensity_average']
        if intensity < 0.0 or intensity > 1.0:
            errors.append(f"intensity_average must be between 0.0 and 1.0, got {intensity}")
    
    # Validate emotional_progression
    progression = output_data.get('emotional_progression', [])
    if len(progression) == 0:
        errors.append("emotional_progression must have at least 1 item")
    
    for i, item in enumerate(progression):
        if 'emotion' not in item:
            errors.append(f"emotional_progression[{i}] missing emotion field")
        if 'intensity' not in item:
            errors.append(f"emotional_progression[{i}] missing intensity field")
        elif item['intensity'] < 0.0 or item['intensity'] > 1.0:
            errors.append(f"emotional_progression[{i}].intensity must be 0.0-1.0")
        if 'sentiment' not in item:
            errors.append(f"emotional_progression[{i}] missing sentiment field")
        elif item['sentiment'] < -1.0 or item['sentiment'] > 1.0:
            errors.append(f"emotional_progression[{i}].sentiment must be -1.0 to 1.0")
        if 'message_snippet' in item and len(item['message_snippet']) > 100:
            errors.append(f"emotional_progression[{i}].message_snippet too long (max 100 chars)")
    
    # Validate triggers
    triggers = output_data.get('triggers', {})
    if 'primary' not in triggers:
        errors.append("Missing triggers.primary")
    
    # Validate risk_indicators
    ri = output_data.get('risk_indicators', {})
    if ri.get('level') not in ['low', 'medium', 'high', 'critical']:
        errors.append("risk_indicators.level must be one of: low, medium, high, critical")
    
    # Validate trend
    if output_data.get('trend') not in ['improving', 'stable', 'declining']:
        errors.append("trend must be one of: improving, stable, declining")
    
    # Validate simple_summary
    summary = output_data.get('simple_summary', '')
    if len(summary) < 20:
        errors.append("simple_summary must be at least 20 characters")
    if len(summary) > 500:
        errors.append("simple_summary must be at most 500 characters")
    
    if errors:
        return False, errors
    
    return True, []


def test_with_sample_files():
    """Test validation với sample output files"""
    base_path = Path(__file__).parent.parent / 'data' / 'test_sets'
    
    print("=" * 60)
    print("TESTING MODEL OUTPUT VALIDATION")
    print("=" * 60)
    
    # Test Clinical Output
    print("\n1. Testing Clinical Assessment Output...")
    clinical_file = base_path / 'sample_output_clinical.json'
    
    if clinical_file.exists():
        with open(clinical_file, 'r', encoding='utf-8') as f:
            clinical_data = json.load(f)
        
        valid, errors = validate_clinical_output(clinical_data)
        
        if valid:
            print("   ✅ PASSED - Clinical output is valid")
        else:
            print("   ❌ FAILED - Clinical output has errors:")
            for error in errors:
                print(f"      - {error}")
    else:
        print(f"   ⚠️  Sample file not found: {clinical_file}")
    
    # Test Dashboard Output
    print("\n2. Testing Dashboard Analytics Output...")
    dashboard_file = base_path / 'sample_output_dashboard.json'
    
    if dashboard_file.exists():
        with open(dashboard_file, 'r', encoding='utf-8') as f:
            dashboard_data = json.load(f)
        
        valid, errors = validate_dashboard_output(dashboard_data)
        
        if valid:
            print("   ✅ PASSED - Dashboard output is valid")
        else:
            print("   ❌ FAILED - Dashboard output has errors:")
            for error in errors:
                print(f"      - {error}")
    else:
        print(f"   ⚠️  Sample file not found: {dashboard_file}")
    
    print("\n" + "=" * 60)


def validate_your_model_output(output_json_path, analysis_type='dashboard'):
    """
    Validate output từ model của bạn
    
    Usage:
        python test_model_integration.py path/to/your/output.json clinical
        python test_model_integration.py path/to/your/output.json dashboard
    """
    try:
        with open(output_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"\nValidating {analysis_type} output from: {output_json_path}")
        print("-" * 60)
        
        if analysis_type == 'clinical':
            valid, errors = validate_clinical_output(data)
        else:
            valid, errors = validate_dashboard_output(data)
        
        if valid:
            print("✅ OUTPUT IS VALID!")
            print("Your model output conforms to the required schema.")
            return True
        else:
            print("❌ OUTPUT HAS ERRORS:")
            for error in errors:
                print(f"   - {error}")
            print("\nPlease fix these issues in your model output.")
            return False
            
    except FileNotFoundError:
        print(f"❌ File not found: {output_json_path}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Validate custom file
        output_path = sys.argv[1]
        analysis_type = sys.argv[2] if len(sys.argv) > 2 else 'dashboard'
        validate_your_model_output(output_path, analysis_type)
    else:
        # Test with sample files
        test_with_sample_files()
        
        print("\n" + "=" * 60)
        print("USAGE:")
        print("  Test your model output:")
        print("    python test_model_integration.py your_output.json clinical")
        print("    python test_model_integration.py your_output.json dashboard")
        print("=" * 60)
