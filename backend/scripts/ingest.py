#!/usr/bin/env python3
"""
Script to ingest documents into the knowledge base.
Usage:
    python -m scripts.ingest /path/to/documents  # Ingest specific directory
    python -m scripts.ingest --default           # Ingest default knowledge base directory
    python -m scripts.ingest --sample            # Create and ingest sample documents

This will recursively process all documents in the specified directory.
"""

import sys
import logging
import asyncio
import argparse
from pathlib import Path
import os

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.knowledge_base import KnowledgeBase
from app.config import KNOWLEDGE_BASE_DIR

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

async def ingest_directory(directory_path: str):
    """
    Ingest all documents in the specified directory
    
    Args:
        directory_path: Path to the directory containing documents
    """
    kb = KnowledgeBase()
    
    dir_path = Path(directory_path)
    if not dir_path.exists() or not dir_path.is_dir():
        logger.error(f"Directory not found: {directory_path}")
        return
    
    logger.info(f"Starting ingestion from directory: {directory_path}")
    
    total_chunks = await kb.ingest_directory(dir_path)
    
    logger.info(f"Ingestion complete. Total chunks added: {total_chunks}")
    logger.info(f"Total documents in knowledge base: {kb.get_document_count()}")

async def ingest_default_knowledge_base():
    """Ingest documents from the default knowledge base directory"""
    if not KNOWLEDGE_BASE_DIR.exists():
        logger.error(f"Default knowledge base directory not found: {KNOWLEDGE_BASE_DIR}")
        return
        
    logger.info(f"Starting ingestion from default knowledge base: {KNOWLEDGE_BASE_DIR}")
    
    kb = KnowledgeBase()
    total_chunks = await kb.ingest_directory(KNOWLEDGE_BASE_DIR)
    
    logger.info(f"Ingestion complete. Total chunks added: {total_chunks}")
    logger.info(f"Total documents in knowledge base: {kb.get_document_count()}")

def add_sample_documents():
    """Add sample documents to the knowledge base directory"""
    # Create subdirectories
    frameworks_dir = KNOWLEDGE_BASE_DIR / "frameworks"
    case_studies_dir = KNOWLEDGE_BASE_DIR / "case_studies"
    best_practices_dir = KNOWLEDGE_BASE_DIR / "best_practices"
    industry_trends_dir = KNOWLEDGE_BASE_DIR / "industry_trends"
    
    frameworks_dir.mkdir(parents=True, exist_ok=True)
    case_studies_dir.mkdir(parents=True, exist_ok=True)
    best_practices_dir.mkdir(parents=True, exist_ok=True)
    industry_trends_dir.mkdir(parents=True, exist_ok=True)
    
    # Create sample ADKAR framework document
    adkar_path = frameworks_dir / "adkar_model.md"
    with open(adkar_path, 'w') as f:
        f.write("""# ADKAR Change Management Model

## Overview
The ADKAR model is a goal-oriented change management model that guides individual and organizational change. Created by Prosci founder Jeff Hiatt, ADKAR is an acronym that represents the five tangible and concrete outcomes that people need to achieve for lasting change: Awareness, Desire, Knowledge, Ability and Reinforcement.

## The Five Elements of ADKAR

### Awareness
Awareness represents a person's understanding of the nature of the change, why the change is being made, and the risk of not changing. Building awareness means sharing the business reasons for change and addressing the "What's in it for me?" questions.

Key activities:
- Communicate the business need for change
- Share external drivers like competition, market trends, etc.
- Explain the "why" behind the change
- Address how current operations are inadequate
- Use data to reinforce the need for change

### Desire
Desire represents the willingness to support and participate in the change. This is the most difficult element to achieve because it ultimately comes down to a personal choice that cannot be forced.

Key activities:
- Address the personal motivators (WIIFM)
- Engage influential leaders to champion the change
- Address resistance actively and openly
- Involve people in the change process
- Address organizational barriers that may prevent desire

### Knowledge
Knowledge represents the information, training, and education necessary to know how to change. This includes knowing how to change during the transition and how to perform effectively in the future state.

Key activities:
- Provide formal training programs
- Create job aids and reference materials
- Offer one-on-one coaching
- Provide access to subject matter experts
- Create forums for questions and answers

### Ability
Ability represents the realization or execution of the change. It's turning knowledge into action. This is where people develop the skills and behaviors needed to implement the change.

Key activities:
- Allow time for developing new abilities
- Provide hands-on practice sessions
- Coach individuals through the change
- Assess progress and provide feedback
- Address barriers impacting ability

### Reinforcement
Reinforcement represents the internal and external factors that sustain the change. Without reinforcement, people may revert to old behaviors.

Key activities:
- Celebrate success and recognize individuals
- Provide incentives and rewards
- Gather and analyze feedback
- Measure adoption
- Take corrective actions and adjust as needed

## Applying ADKAR in Organizations

The ADKAR model is used for:
- Diagnosing employee resistance to change
- Helping employees transition through the change process
- Creating a successful action plan for personal and professional advancement during change
- Developing a change management plan for employees

## Key Considerations

- ADKAR is sequential - each step builds upon the previous one
- If someone is struggling with change, identify which element they're struggling with
- Different people may be at different stages of the ADKAR process
- Reinforce all elements throughout the change process
- Measure progress against each element of ADKAR
""")
    logger.info(f"Created sample document: {adkar_path}")
    
    # Create sample Lewin's Change Management document
    lewin_path = frameworks_dir / "lewins_model.md"
    with open(lewin_path, 'w') as f:
        f.write("""# Lewin's Change Management Model

## Overview
Developed by psychologist Kurt Lewin in the 1940s, Lewin's Change Management Model is one of the earliest and most fundamental approaches to managing change. The model proposes that change involves a three-stage process: Unfreeze, Change, and Refreeze.

## The Three Stages

### Unfreeze
The first stage involves preparing the organization to accept that change is necessary, which involves breaking down the existing status quo before building up a new way of operating.

Key activities:
- Create motivation for change by developing a compelling message as to why change is needed
- Challenge the current state and establish a sense of urgency
- Address concerns and fears openly
- Build trust and recognize the need to move away from current comfort zones
- Identify what needs to change and ensure strong support from leadership

### Change (Transition)
The second stage occurs as people begin to resolve their uncertainty and look for new ways to do things. People start to believe and act in ways that support the new direction.

Key activities:
- Communicate often to ensure people understand the benefits
- Dispel rumors and misinformation
- Empower action by providing resources and removing obstacles
- Involve people in the process and encourage their contribution
- Create short-term achievable targets
- Provide support, training, and coaching to maintain momentum

### Refreeze
The third stage is when the changes are accepted and become the new norm. People form new relationships and become comfortable with their routines. The organization starts to stabilize.

Key activities:
- Anchor the changes into the culture
- Develop ways to sustain the change
- Establish feedback systems
- Create a reward system
- Celebrate success and establish positive recognition
- Provide support and training where needed
- Make the change part of performance management

## Applying Lewin's Model in Organizations

Lewin's model is particularly useful for:
- Large-scale organizational changes
- Situations requiring a complete break from the past
- Changes where stability is desired after implementation
- Organizations with strong traditions and defined processes

## Key Considerations

- The model emphasizes the importance of preparation before change
- It recognizes that change can be uncomfortable and stressful
- The model acknowledges resistance as a natural part of the process
- It emphasizes the importance of institutionalizing and stabilizing change
- The model can sometimes oversimplify the complex process of change
- It might not be suitable for organizations in constantly changing environments

## Force Field Analysis

As part of his model, Lewin also developed Force Field Analysis, a framework for identifying and examining the forces that influence a situation:
- Driving forces push in the direction of change
- Restraining forces push against change

By analyzing and addressing these forces, organizations can strengthen the factors driving change and weaken those restraining it, making the change process more effective.
""")
    logger.info(f"Created sample document: {lewin_path}")
    
    # Create sample Kotter's 8-Step Model document
    kotter_path = frameworks_dir / "kotters_model.md"
    with open(kotter_path, 'w') as f:
        f.write("""# Kotter's 8-Step Change Model

## Overview
Developed by Dr. John Kotter, a professor at Harvard Business School and world-renowned change expert, the 8-Step Process for Leading Change provides a practical methodology for implementing successful transformations. Based on Kotter's observations of hundreds of organizations trying to transform themselves, this model has become one of the most widely adopted frameworks for managing organizational change.

## The Eight Steps

### 1. Create a Sense of Urgency
To initiate change, it's crucial to help others see the need for change and the importance of acting immediately.

Key activities:
- Identify and discuss crises, potential crises, or major opportunities
- Develop bold, aspirational opportunities for the future
- Use customer feedback and market data to support your arguments
- Engage stakeholders in candid discussions about competitive realities
- Aim for at least 75% of managers to be convinced of the need for change

### 2. Build a Guiding Coalition
Assemble a group with enough power to lead the change effort and encourage them to work together as a team.

Key activities:
- Form a powerful coalition of influencers based on position power, expertise, credibility, and leadership
- Ensure this group includes representation from different departments and levels
- Focus on building trust and emotional commitment among the team
- Remove blockers and non-team players who can undermine efforts
- Ensure the coalition operates outside the normal hierarchy

### 3. Form a Strategic Vision and Initiatives
Create a vision to help direct the change effort and develop strategic initiatives to achieve that vision.

Key activities:
- Determine the core values essential to achieving the vision
- Develop a short summary (one or two sentences) that captures the future state
- Create a strategy for executing the vision
- Ensure the vision is easy to communicate and appeals to stakeholders
- Make sure the guiding coalition can describe the vision in under five minutes

### 4. Enlist a Volunteer Army
Large-scale change can only occur when large numbers of people rally around a common opportunity and work together toward making it happen.

Key activities:
- Communicate the vision and strategy frequently and powerfully
- Keep the message simple and authentic
- Use all existing communication channels to spread the vision
- Address people's concerns and anxieties openly and honestly
- Apply the vision to all aspects of operations, from training to performance reviews
- Lead by example – demonstrate the behavior you expect from others

### 5. Enable Action by Removing Barriers
Remove obstacles that prevent people from acting on the vision.

Key activities:
- Identify and remove barriers to change (processes, structures, etc.)
- Align systems, structures, and skills with the new vision
- Confront supervisors who undermine the change effort
- Provide resources for change implementation
- Recognize and reward people who make the vision happen

### 6. Generate Short-Term Wins
Plan for and create visible improvements or successes as quickly as possible.

Key activities:
- Look for projects that can be implemented without help from strong critics
- Choose projects where success is likely and affordable
- Carefully select the first projects – they should be meaningful but achievable
- Thoroughly analyze the pros and cons of targets
- Recognize and reward those involved in the improvements

### 7. Sustain Acceleration
After early successes, press harder and faster. Build on the credibility gained from short-term wins to tackle bigger problems.

Key activities:
- Use increased credibility to change systems, structures, and policies that don't align with the vision
- Hire, promote, and develop employees who can implement the vision
- Reinvigorate the process with new projects and change agents
- Maintain a sense of urgency – don't declare victory too soon
- Continue to identify what needs to change

### 8. Institute Change
Articulate the connections between the new behaviors and organizational success, and develop methods to ensure leadership development and succession.

Key activities:
- Create a new culture through shared values and norms of behavior
- Publicly recognize the connection between new actions and improved performance
- Develop means to ensure leadership development and succession
- Make the changes part of the organization's cultural fabric
- Tell success stories frequently to reinforce the value of change

## Applying Kotter's Model in Organizations

Kotter's model is particularly effective for:
- Large-scale organizational transformations
- Changes requiring buy-in from many stakeholders
- Environments with potential resistance to change
- Organizations that need to build momentum and sustain change over time

## Key Considerations

- The model emphasizes the importance of gaining buy-in
- It recognizes that change is a process, not an event
- The approach focuses on preparing and accepting change rather than the actual change itself
- All steps are important, and skipping steps can create problems
- Organizations should be prepared for the long haul – effective change takes time
- The model is a top-down approach that might not always encourage feedback from all levels
""")
    logger.info(f"Created sample document: {kotter_path}")
    
    # Create sample case study document
    case_study_path = case_studies_dir / "tech_company_digital_transformation.md"
    with open(case_study_path, 'w') as f:
        f.write("""# Case Study: Global Tech Company's Digital Transformation

## Company Background
A multinational technology company with 50,000 employees across 30 countries needed to transform its operations from primarily hardware-focused to a cloud-based services model. This shift required changes in organizational structure, skills, processes, and culture.

## Challenge
The company faced several challenges:
- Long-established hardware business culture resistant to services-oriented approach
- Skills gap in cloud technologies and services delivery
- Siloed departments working in isolation
- Legacy systems and processes designed for hardware development cycles
- Declining hardware sales creating urgency for new revenue streams

## Change Management Approach
The company employed a hybrid change management approach combining elements of Kotter's 8-Step Process and the ADKAR model:

### Phase 1: Setting the Foundation (First 3 months)
- Established a dedicated transformation office reporting directly to the CEO
- Created a clear and compelling "burning platform" narrative using market data
- Formed a guiding coalition with respected leaders from different departments
- Developed vision: "Empowering customers through seamless technology experiences"

### Phase 2: Building Awareness and Desire (Months 3-9)
- Conducted 50+ town halls across global locations
- Created department-specific messaging addressing "What's in it for me?"
- Mapped impacts for each role and department
- Established a network of 200 "Digital Champions" across the organization
- Implemented a comprehensive communication plan with regular updates

### Phase 3: Enabling the Change (Months 6-18)
- Launched Digital Academy offering 100+ courses for upskilling
- Created cross-functional teams to break down silos
- Redesigned performance metrics to focus on customer success vs. product metrics
- Provided leaders with coaching on leading through change
- Created collaborative workspaces to encourage innovation
- Piloted new service offerings with early adopter customers

### Phase 4: Implementation and Reinforcement (Months 12-24)
- Reorganized into customer-centric business units
- Celebrated and widely publicized early wins
- Established communities of practice for knowledge sharing
- Updated recruitment, onboarding, and promotion criteria
- Revised compensation structures to reward service-focused behaviors
- Implemented a feedback system to address emerging challenges

## Results
After 24 months:
- Cloud services revenue grew from 15% to 40% of total revenue
- Employee engagement scores improved by 18%
- Customer satisfaction increased by 23%
- 70% of employees completed at least one digital upskilling course
- Time-to-market for new offerings decreased by 50%

## Key Success Factors
1. Visible and consistent executive sponsorship
2. Comprehensive approach addressing both organizational and individual change needs
3. Significant investment in capability building
4. Patience with the human side of change
5. Willingness to adjust approaches based on feedback
6. Celebration of successes and learning from failures

## Lessons Learned
1. Resistance was strongest in the middle management layer rather than frontline employees
2. Geographic regions needed tailored approaches based on local culture
3. The organization underestimated the importance of changing informal networks and power structures
4. Success required changes to fundamental HR systems like performance management
5. The most effective communication came from direct supervisors, not the transformation office
""")
    logger.info(f"Created sample document: {case_study_path}")
    
    # Create sample best practices document
    best_practices_path = best_practices_dir / "managing_resistance_to_change.md"
    with open(best_practices_path, 'w') as f:
        f.write("""# Best Practices for Managing Resistance to Change

## Understanding Resistance to Change

Resistance to change is a natural human response. It typically stems from:

1. **Loss of control**: People resist when they feel decisions are being made without their input
2. **Excess uncertainty**: If the change path isn't clear, people hesitate to move forward
3. **Surprise factor**: Changes announced without preparation meet strong resistance
4. **Everything seems different**: Too many differences from the status quo overwhelm people
5. **Loss of face**: People resist if they feel past ways of working are being criticized
6. **Concerns about competence**: Worry about inability to perform well in the new environment
7. **Ripple effects**: Disruption to other projects or personal life
8. **Past resentments**: Unresolved feelings from past changes re-emerge
9. **Real threats**: Sometimes resistance is based on legitimate concerns

## Proactive Strategies for Minimizing Resistance

### 1. Involve People Early
- Form focus groups to gather input before finalizing plans
- Create change ambassador networks across departments
- Use collaborative tools for gathering feedback and ideas
- Give people meaningful roles in the change process
- Share decision-making where possible

### 2. Communicate Effectively
- Explain the "why" before the "what" and "how"
- Address WIIFM ("What's in it for me?") directly
- Be transparent about what is known and unknown
- Create consistent messaging across all channels
- Tailor communication to different stakeholders
- Use storytelling to create an emotional connection
- Provide regular updates even when there's little new information

### 3. Build Trust Through Honesty
- Acknowledge the difficulties and challenges
- Don't sugarcoat the negative aspects
- Address rumors quickly with facts
- Admit when you don't have all the answers
- Follow through on commitments made during the change process

### 4. Provide Comprehensive Support
- Offer training well before new skills are needed
- Create multiple learning paths for different learning styles
- Establish peer support networks
- Provide job aids and reference materials
- Ensure managers have time to support their teams
- Create safe spaces to practice new skills
- Offer one-on-one coaching for those struggling the most

### 5. Make Change More Digestible
- Break large changes into smaller steps
- Set and celebrate short-term wins
- Create transition periods where both old and new systems operate
- Allow for adaptation of the change to local conditions where possible
- Provide adequate time for adjustment

## Responding to Active Resistance

### 1. Listen and Acknowledge
- Create safe channels for expressing concerns
- Demonstrate genuine interest in understanding objections
- Acknowledge valid points in the resistance
- Show empathy for the emotional aspects of change

### 2. Focus on Resisters
- Identify opinion leaders and work with them individually
- Look for underlying interests behind stated positions
- Find areas of common ground to build upon
- Convert strong resisters into change agents when possible

### 3. Address Resistance Openly
- Discuss concerns in group settings to bring issues to light
- Use data to address misconceptions
- Reframe resistance as useful feedback for improving the change
- Create FAQ documents that directly address common objections

### 4. Adjust Approaches Based on Resistance Types
- Educational tactics for resistance based on misunderstanding
- Participative tactics for resistance based on feeling excluded
- Supportive tactics for fear-based resistance
- Negotiative tactics for resistance based on competing commitments

### 5. Know When to Move Forward
- Distinguish between healthy skepticism and entrenched opposition
- Be willing to make necessary adjustments based on valid concerns
- Recognize when further discussion will not be productive
- Have clear decision rights for when consensus isn't possible
- Be prepared to make difficult personnel decisions if necessary

## Measuring and Monitoring Resistance

- Conduct regular pulse surveys to gauge acceptance
- Track participation in change-related activities
- Monitor informal communication channels and networks
- Establish early warning indicators for resistance issues
- Create feedback loops to continually improve change approaches

## Building Change Resilience for the Future

- Reward and recognize those who adapt well to change
- Capture lessons learned from each change initiative
- Include adaptability in performance evaluations
- Provide ongoing development in change management skills
- Build change management capability throughout the organization
""")
    logger.info(f"Created sample document: {best_practices_path}")
    
    # Create sample industry trends document
    industry_trends_path = industry_trends_dir / "change_management_trends_2024.md"
    with open(industry_trends_path, 'w') as f:
        f.write("""# Change Management Trends for 2024 and Beyond

## Executive Summary

As organizations navigate increasingly complex and uncertain environments, change management approaches are evolving to meet new challenges. This document outlines the key trends shaping the future of organizational change management, with implications for practitioners and leaders.

## Key Trends

### 1. Digital-First Change Management

Digital transformation continues to be a driving force, but now change management itself is becoming digital-first:

- **Virtual change experience rooms** providing immersive simulations of future states
- **AI-powered change assistants** offering personalized guidance through transitions
- **Digital adoption platforms** integrated with core applications to provide real-time support
- **Change analytics dashboards** providing real-time insights into adoption metrics
- **Virtual reality training** environments for practicing new skills and processes

Organizations are increasingly using these digital tools to scale change management efforts and provide more personalized support than traditional approaches allow.

### 2. Neuroscience-Informed Change Approaches

The application of neuroscience principles to change management is gaining mainstream adoption:

- Designing change initiatives to work with rather than against brain functioning
- Recognition that change triggers threat responses in the brain requiring specific mitigation
- Incorporating techniques that leverage neuroplasticity to build new habits
- Attention to cognitive load during transitions to prevent overwhelm
- Focus on creating psychological safety as a foundation for change

Change practitioners are incorporating brain-friendly techniques that recognize cognitive biases, emotion processing, and attention management to improve change outcomes.

### 3. Adaptive and Agile Change Management

Traditional linear change models are giving way to more flexible approaches:

- Iterative implementation with frequent feedback and adjustment cycles
- Decentralized change leadership distributed throughout the organization
- Emphasis on minimum viable change before full-scale implementation
- Integration of change management with agile product development
- Shift from predetermined change paths to emergent and evolving approaches

Organizations are moving away from rigid, prescriptive change methodologies toward frameworks that can flex with evolving needs and insights gained during implementation.

### 4. Human-Centered Change Design

There is increasing recognition that successful change requires deep empathy with those experiencing it:

- Use of design thinking principles in change planning
- Journey mapping for different stakeholder groups
- Co-creation of change approaches with employees
- Personalization of change support based on individual needs
- Focus on emotional experience alongside behavioral and cognitive elements

By designing change with rather than for people, organizations are achieving higher engagement and reducing resistance.

### 5. Systemic and Holistic Change Approaches

Recognition that sustainable change requires addressing entire systems rather than isolated components:

- Integration of individual, team, organizational, and ecosystem levels in change planning
- Consideration of cultural, technical, structural, and process elements as interconnected
- Network analysis to understand informal influence patterns
- Greater attention to upstream and downstream impacts of changes
- Recognition of the need to evolve supporting systems (rewards, metrics, etc.)

This trend reflects growing awareness that treating change as isolated initiatives rather than systemic transformations leads to disappointing results and change fatigue.

### 6. Resilience and Well-being Focus

With the acceleration of change and increasing complexity, supporting human adaptation capabilities is becoming central:

- Building change resilience as an ongoing organizational capability
- Integration of well-being initiatives with major change programs
- Attention to sustainable change pacing to prevent burnout
- Development of psychological capital (hope, efficacy, resilience, optimism)
- Recognition and mitigation of change fatigue

Organizations are recognizing that their capacity for change is directly linked to the resilience and well-being of their people.

### 7. Hybrid Workforce Considerations

The shift to hybrid and remote work models is fundamentally changing change management approaches:

- Reimagined change communication strategies for distributed teams
- Virtual collaboration techniques for co-creating change
- Digital community building to support peer learning during transitions
- Location-equitable engagement approaches
- Asynchronous change support mechanisms

Change practitioners are developing new tools and techniques specifically designed for hybrid environments where traditional in-person approaches no longer suffice.

## Implications for Organizations

As these trends reshape change management practice, organizations should consider:

1. **Upskilling change practitioners** in digital, neuroscience, design thinking, and systems thinking capabilities
2. **Revising change methodologies** to incorporate more adaptive and human-centered elements
3. **Investing in digital change tools** that can scale support and provide analytics
4. **Building change capability** throughout the organization rather than centralizing expertise
5. **Integrating change management** with other organizational functions like HR, IT, and operations

## Conclusion

The field of change management is itself undergoing significant transformation. Organizations that evolve their change approaches to align with these trends will be better positioned to navigate complexity, accelerate adoption, and build sustainable change capability.
""")
    logger.info(f"Created sample document: {industry_trends_path}")

async def main():
    """Main entry point for the script"""
    parser = argparse.ArgumentParser(description="Ingest documents into the knowledge base")
    
    # Create mutually exclusive group for command-line arguments
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--default", action="store_true", help="Ingest documents from the default knowledge base directory")
    group.add_argument("--sample", action="store_true", help="Create and ingest sample documents")
    group.add_argument("directory", nargs="?", help="Directory containing documents to ingest")
    
    args = parser.parse_args()
    
    if args.sample:
        logger.info("Creating sample documents...")
        add_sample_documents()
        logger.info("Ingesting sample documents...")
        await ingest_default_knowledge_base()
    elif args.default:
        logger.info("Ingesting documents from default knowledge base...")
        await ingest_default_knowledge_base()
    elif args.directory:
        logger.info(f"Ingesting documents from {args.directory}...")
        await ingest_directory(args.directory)
    else:
        parser.print_help()

if __name__ == "__main__":
    asyncio.run(main())