-- ============================================
-- Application Registry Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================

-- ============================================
-- Insert Technologies
-- ============================================
INSERT INTO technologies (technology_name, technology_type) VALUES
    -- Programming Languages
    ('Java', 'Programming Language'),
    ('C++', 'Programming Language'),
    ('Python', 'Programming Language'),
    ('JavaScript', 'Programming Language'),
    ('TypeScript', 'Programming Language'),
    ('Go', 'Programming Language'),
    ('C#', 'Programming Language'),
    ('PHP', 'Programming Language'),
    ('Ruby', 'Programming Language'),
    ('Swift', 'Programming Language'),
    ('Kotlin', 'Programming Language'),
    -- Frontend
    ('React', 'Frontend'),
    ('Angular', 'Frontend'),
    ('Vue.js', 'Frontend'),
    ('Next.js', 'Frontend'),
    ('HTML/CSS', 'Frontend'),
    -- Backend
    ('Node.js', 'Backend'),
    ('Spring Boot', 'Backend'),
    ('Django', 'Backend'),
    ('ASP.NET', 'Backend'),
    ('Express.js', 'Backend'),
    ('Ruby on Rails', 'Backend'),
    -- Database
    ('PostgreSQL', 'Database'),
    ('MySQL', 'Database'),
    ('MongoDB', 'Database'),
    ('Redis', 'Database'),
    ('Elasticsearch', 'Database'),
    -- Frameworks
    ('TensorFlow', 'Framework'),
    ('Apache Spark', 'Framework'),
    ('Hadoop', 'Framework'),
    ('Tailwind CSS', 'Framework'),
    -- Libraries
    ('jQuery', 'Library'),
    ('Lodash', 'Library'),
    ('Axios', 'Library')
ON CONFLICT (technology_name, technology_type) DO NOTHING;

-- ============================================
-- Insert Sample Applications
-- ============================================

-- Google Search
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'Google Search',
    'The world''s most widely used web search engine, processing billions of search queries daily using advanced algorithms and machine learning.',
    'Google',
    'Google Search Team',
    'Search Engine',
    'Active',
    '2024.1',
    'To organize the world''s information and make it universally accessible and useful through web search.',
    true,
    'Dominant market share globally. Uses PageRank algorithm and neural matching.'
);

-- Yahoo Search
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES (
    'a1000000-0000-0000-0000-000000000002',
    'Yahoo Search',
    'A web search engine provided by Yahoo, powered by Microsoft Bing''s search technology.',
    'Yahoo',
    'Yahoo Search Division',
    'Search Engine',
    'Active',
    '2024.1',
    'To provide web search capabilities as part of the Yahoo ecosystem of services.',
    true,
    'Powered by Bing since 2009 through a partnership with Microsoft.'
);

-- Bing
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'Bing',
    'Microsoft''s web search engine offering search, image, video, and map results with AI-powered features.',
    'Microsoft',
    'Microsoft Bing Team',
    'Search Engine',
    'Active',
    '2024.2',
    'To provide intelligent search experiences powered by AI and integrated with Microsoft services.',
    true,
    'Integrated with Copilot AI assistant. Powers Yahoo Search and DuckDuckGo results.'
);

-- Google Maps
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES (
    'a1000000-0000-0000-0000-000000000004',
    'Google Maps',
    'A comprehensive mapping and navigation service offering street maps, satellite imagery, real-time traffic, and route planning.',
    'Google',
    'Google Geo Team',
    'Mapping & Navigation',
    'Active',
    '11.0',
    'To help users navigate the world with accurate maps, real-time traffic information, and location-based services.',
    true,
    'Available on web, iOS, and Android. Includes Street View and indoor mapping.'
);

-- Google News
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES (
    'a1000000-0000-0000-0000-000000000005',
    'Google News',
    'A news aggregator service that compiles and personalizes news articles from various sources worldwide.',
    'Google',
    'Google News Team',
    'News & Media',
    'Active',
    '5.0',
    'To aggregate and personalize news content from multiple sources for users worldwide.',
    true,
    'Uses AI to curate and recommend news. Available in over 35 languages.'
);

-- Slack
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES (
    'a1000000-0000-0000-0000-000000000006',
    'Slack',
    'A business communication platform offering instant messaging, file sharing, and integrations with productivity tools.',
    'Salesforce',
    'Slack Engineering',
    'Communication',
    'Active',
    '4.35',
    'To streamline team communication and collaboration with channels, direct messaging, and app integrations.',
    true,
    'Acquired by Salesforce in 2021. Supports thousands of third-party integrations.'
);

-- Microsoft Teams
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES (
    'a1000000-0000-0000-0000-000000000007',
    'Microsoft Teams',
    'A unified communication and collaboration platform within the Microsoft 365 suite.',
    'Microsoft',
    'Microsoft Teams Engineering',
    'Communication',
    'Active',
    '24.1',
    'To provide a unified platform for chat, meetings, file collaboration, and app integration for organizations.',
    true,
    'Integrated with Microsoft 365. Supports up to 10,000 participants in meetings.'
);

-- ============================================
-- Link Technologies to Applications
-- ============================================

-- Google Search Technologies
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000001', id FROM technologies WHERE technology_name IN ('Java', 'C++', 'Python', 'Go') AND technology_type = 'Programming Language';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000001', id FROM technologies WHERE technology_name = 'Angular' AND technology_type = 'Frontend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000001', id FROM technologies WHERE technology_name = 'Node.js' AND technology_type = 'Backend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000001', id FROM technologies WHERE technology_name IN ('PostgreSQL', 'Elasticsearch') AND technology_type = 'Database';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000001', id FROM technologies WHERE technology_name = 'TensorFlow' AND technology_type = 'Framework';

-- Yahoo Search Technologies
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000002', id FROM technologies WHERE technology_name IN ('Java', 'PHP', 'JavaScript') AND technology_type = 'Programming Language';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000002', id FROM technologies WHERE technology_name = 'React' AND technology_type = 'Frontend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000002', id FROM technologies WHERE technology_name = 'Node.js' AND technology_type = 'Backend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000002', id FROM technologies WHERE technology_name = 'MySQL' AND technology_type = 'Database';

-- Bing Technologies
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000003', id FROM technologies WHERE technology_name IN ('C#', 'C++', 'Python') AND technology_type = 'Programming Language';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000003', id FROM technologies WHERE technology_name = 'React' AND technology_type = 'Frontend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000003', id FROM technologies WHERE technology_name = 'ASP.NET' AND technology_type = 'Backend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000003', id FROM technologies WHERE technology_name IN ('PostgreSQL', 'Elasticsearch') AND technology_type = 'Database';

-- Google Maps Technologies
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000004', id FROM technologies WHERE technology_name IN ('Java', 'C++', 'JavaScript', 'Kotlin', 'Swift') AND technology_type = 'Programming Language';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000004', id FROM technologies WHERE technology_name = 'Angular' AND technology_type = 'Frontend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000004', id FROM technologies WHERE technology_name = 'Node.js' AND technology_type = 'Backend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000004', id FROM technologies WHERE technology_name = 'PostgreSQL' AND technology_type = 'Database';

-- Google News Technologies
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000005', id FROM technologies WHERE technology_name IN ('Python', 'Java', 'JavaScript') AND technology_type = 'Programming Language';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000005', id FROM technologies WHERE technology_name = 'Angular' AND technology_type = 'Frontend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000005', id FROM technologies WHERE technology_name = 'Django' AND technology_type = 'Backend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000005', id FROM technologies WHERE technology_name = 'PostgreSQL' AND technology_type = 'Database';

-- Slack Technologies
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000006', id FROM technologies WHERE technology_name IN ('Java', 'JavaScript', 'TypeScript') AND technology_type = 'Programming Language';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000006', id FROM technologies WHERE technology_name = 'React' AND technology_type = 'Frontend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000006', id FROM technologies WHERE technology_name = 'Node.js' AND technology_type = 'Backend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000006', id FROM technologies WHERE technology_name IN ('MySQL', 'Redis') AND technology_type = 'Database';

-- Microsoft Teams Technologies
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000007', id FROM technologies WHERE technology_name IN ('TypeScript', 'C#', 'JavaScript') AND technology_type = 'Programming Language';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000007', id FROM technologies WHERE technology_name = 'React' AND technology_type = 'Frontend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000007', id FROM technologies WHERE technology_name = 'ASP.NET' AND technology_type = 'Backend';
INSERT INTO application_technologies (application_id, technology_id)
SELECT 'a1000000-0000-0000-0000-000000000007', id FROM technologies WHERE technology_name IN ('PostgreSQL', 'Redis') AND technology_type = 'Database';

-- ============================================
-- Application Relationships
-- ============================================

-- Search Engine Relationships (Similar To)
INSERT INTO application_relationships (application_id, related_application_id, relationship_type) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Similar To'),
    ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Similar To'),
    ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Similar To'),
    ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Similar To'),
    ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Similar To'),
    ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Similar To');

-- Google Search related to Google Maps and Google News
INSERT INTO application_relationships (application_id, related_application_id, relationship_type) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Related To'),
    ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'Related To');

-- Communication tools (Similar To)
INSERT INTO application_relationships (application_id, related_application_id, relationship_type) VALUES
    ('a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000007', 'Similar To'),
    ('a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000006', 'Similar To');

-- Yahoo Search depends on Bing
INSERT INTO application_relationships (application_id, related_application_id, relationship_type) VALUES
    ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Depends On');

-- ============================================
-- Benchmark Applications across Domains
-- ============================================

-- Food Delivery & Quick Commerce
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'Zomato', 'Online food ordering, restaurant search and discovery platform connecting users with dining and delivery options.', 'Zomato Ltd', 'Consumer App Team', 'E-Commerce', 'Active', '17.0', 'Provides restaurant discovery, food ordering, payment, and delivery services connecting customers with restaurants and delivery partners.', true, 'Food Delivery & Dining Out platform'),
    ('b1000000-0000-0000-0000-000000000002', 'Zepto', 'Instant grocery and essentials delivery platform delivering products in 10 minutes through a network of dark stores.', 'Zepto Inc', 'Quick Commerce Engineering', 'E-Commerce', 'Active', '6.0', 'Provides online ordering and rapid doorstep delivery through a consumer-facing quick-commerce delivery platform.', true, 'Quick Commerce & 10-minute grocery delivery'),
    ('b1000000-0000-0000-0000-000000000003', 'Blinkit', 'Quick commerce marketplace delivering groceries, fresh produce, and essentials to consumers within minutes.', 'Blinkit Commerce', 'Core Platform', 'E-Commerce', 'Active', '8.5', 'Provides an online ordering and delivery experience with instant fulfillment for household essentials.', true, 'Quick Commerce / Delivery platform'),
    ('b1000000-0000-0000-0000-000000000004', 'Uber Eats', 'On-demand food ordering and delivery platform connecting consumers with local restaurants and independent couriers.', 'Uber Technologies', 'Eats Marketplace', 'E-Commerce', 'Active', '6.120', 'Connects consumers with restaurants for food discovery, ordering, and delivery logistics.', true, 'Food delivery and takeout platform'),
    ('b1000000-0000-0000-0000-000000000005', 'DoorDash', 'On-demand food and convenience delivery logistics platform connecting consumers, merchants, and delivery Dashers.', 'DoorDash Inc', 'Logistics & Marketplace', 'E-Commerce', 'Active', '11.4', 'Facilitates local commerce by enabling customers to order food, groceries, and retail items for on-demand delivery.', true, 'On-demand restaurant and grocery delivery')
ON CONFLICT (id) DO NOTHING;

-- Streaming & Entertainment
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES
    ('b2000000-0000-0000-0000-000000000001', 'Netflix', 'Subscription video-on-demand streaming service offering movies, TV shows, and original content across devices.', 'Netflix Inc', 'Streaming Experience', 'Entertainment', 'Active', '10.2', 'Streams movies, TV series, and documentaries on-demand to subscribers globally with personalized recommendations.', true, 'Online movie streaming platform'),
    ('b2000000-0000-0000-0000-000000000002', 'Amazon Prime Video', 'Premium video streaming and on-demand entertainment platform offering movies, TV shows, and live sports.', 'Amazon', 'Prime Video Team', 'Entertainment', 'Active', '8.1', 'Provides subscription video streaming, original programming, and digital video rentals to consumers.', true, 'Video streaming and entertainment service'),
    ('b2000000-0000-0000-0000-000000000003', 'Disney+', 'Direct-to-consumer video streaming service featuring content from Disney, Pixar, Marvel, Star Wars, and National Geographic.', 'The Walt Disney Company', 'Disney Streaming', 'Entertainment', 'Active', '5.0', 'Streams family and entertainment movies, series, and exclusive originals on-demand.', true, 'On-demand movie and TV streaming service'),
    ('b2000000-0000-0000-0000-000000000004', 'Hulu', 'Premium streaming platform offering current TV episodes, original series, movies, and live TV.', 'The Walt Disney Company', 'Hulu Engineering', 'Entertainment', 'Active', '4.8', 'Provides on-demand television, original series, and movie streaming to subscribers.', true, 'TV and movie streaming service'),
    ('b2000000-0000-0000-0000-000000000005', 'YouTube', 'Video sharing and streaming platform where users can watch, upload, share, and comment on videos.', 'Google', 'YouTube Engineering', 'Entertainment', 'Active', '19.0', 'Provides global video sharing, user-generated content, live streaming, and video discovery.', true, 'Video sharing and streaming platform')
ON CONFLICT (id) DO NOTHING;

-- Ride Booking & Mobility
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES
    ('b3000000-0000-0000-0000-000000000001', 'Uber', 'On-demand ride-hailing and transportation mobility platform connecting riders with drivers.', 'Uber Technologies', 'Rider & Driver Core', 'Transportation / Mobility', 'Active', '4.450', 'Connects riders with drivers for on-demand point-to-point urban transportation and ride booking.', true, 'Ride booking and urban mobility application'),
    ('b3000000-0000-0000-0000-000000000002', 'Ola', 'Urban mobility platform offering ride-hailing, cabs, auto-rickshaws, and bike taxis.', 'ANI Technologies', 'Ola Mobility', 'Transportation / Mobility', 'Active', '5.2', 'Provides on-demand cab and ride booking services for urban commuters.', true, 'Ride booking and cab hailing service'),
    ('b3000000-0000-0000-0000-000000000003', 'Lyft', 'Multimodal transportation network connecting riders with rideshare drivers, bikes, and scooters.', 'Lyft Inc', 'Lyft Engineering', 'Transportation / Mobility', 'Active', '8.3', 'Provides on-demand personal transportation and ridesharing services for commuters.', true, 'Ridesharing and mobility application'),
    ('b3000000-0000-0000-0000-000000000004', 'Grab', 'Superapp providing ride-hailing, transport, and delivery services across Southeast Asia.', 'Grab Holdings', 'Transport Team', 'Transportation / Mobility', 'Active', '5.200', 'Connects consumers with on-demand transport, ride booking, and mobility solutions.', true, 'Ride hailing and on-demand mobility platform')
ON CONFLICT (id) DO NOTHING;

-- Online Shopping / E-Commerce
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES
    ('b4000000-0000-0000-0000-000000000001', 'Amazon', 'Global online retail and marketplace platform offering millions of consumer products, logistics, and customer services.', 'Amazon', 'Retail Consumer Team', 'E-Commerce', 'Active', '28.0', 'Enables customers to search, browse, buy, and track delivery of consumer products online.', true, 'Online shopping and e-commerce marketplace platform'),
    ('b4000000-0000-0000-0000-000000000002', 'Flipkart', 'Major e-commerce marketplace platform for electronics, fashion, home essentials, and groceries.', 'Flipkart Private Ltd', 'Marketplace Engineering', 'E-Commerce', 'Active', '7.8', 'Provides online shopping, merchant storefronts, and doorstep product delivery to consumers.', true, 'E-commerce marketplace platform'),
    ('b4000000-0000-0000-0000-000000000003', 'eBay', 'Global online auction and consumer-to-consumer / business-to-consumer e-commerce marketplace.', 'eBay Inc', 'Marketplace Core', 'E-Commerce', 'Active', '6.100', 'Connects buyers and sellers for online purchasing, bidding, and selling of goods.', true, 'Online marketplace and auction platform'),
    ('b4000000-0000-0000-0000-000000000004', 'Walmart', 'Omnichannel retail platform providing online shopping, store pickup, and delivery of consumer goods.', 'Walmart Inc', 'Walmart eCommerce', 'E-Commerce', 'Active', '24.1', 'Enables customers to purchase groceries, electronics, and home goods online for delivery or pickup.', true, 'Retail e-commerce and delivery platform'),
    ('b4000000-0000-0000-0000-000000000005', 'Myntra', 'Fashion and lifestyle e-commerce platform offering clothing, footwear, and accessories.', 'Myntra Designs', 'Fashion Marketplace', 'E-Commerce', 'Active', '5.1', 'Provides online discovery, browsing, and purchasing of fashion and lifestyle products.', true, 'Fashion e-commerce platform')
ON CONFLICT (id) DO NOTHING;

-- Peer Communication & Navigation Platforms
INSERT INTO applications (id, application_name, description, developer_name, development_team, category, status, version, purpose, is_existing, additional_notes)
VALUES
    ('b5000000-0000-0000-0000-000000000001', 'Discord', 'Voice, video, and text communication service used by communities, gamers, and teams worldwide.', 'Discord Inc', 'Core Client', 'Communication', 'Active', '1.0', 'Provides real-time voice channels, text messaging, and community servers for collaboration and social groups.', true, 'Community and team communication platform'),
    ('b5000000-0000-0000-0000-000000000002', 'Apple Maps', 'Web and mobile mapping and navigation service providing turn-by-turn directions, transit info, and street-level imagery.', 'Apple', 'Maps Engineering', 'Mapping & Navigation', 'Active', '3.0', 'Provides maps, navigation directions, and location discovery for mobile and web users.', true, 'Mapping and navigation service'),
    ('b5000000-0000-0000-0000-000000000003', 'Waze', 'Community-driven GPS navigation app providing real-time traffic updates, road hazards, and route optimization.', 'Google', 'Waze Team', 'Mapping & Navigation', 'Active', '4.95', 'Provides real-time crowd-sourced GPS navigation and traffic alerts to drivers.', true, 'Community GPS navigation application')
ON CONFLICT (id) DO NOTHING;

