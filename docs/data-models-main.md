# Data Models - Main

## TypeScript Interfaces

### Core Data Structures

#### Group
- **Purpose**: Represents a group of passive skill nodes in the tree
- **Fields**:
  - `x`, `y`: Position coordinates
  - `isProxy`: Boolean indicating proxy status
  - `orbits`: Array of orbit numbers
  - `background?`: Optional background image info
  - `nodes`: Array of node IDs in this group

#### Node
- **Purpose**: Individual passive skill node
- **Fields**:
  - `skill`: Skill ID
  - `name`: Node name
  - `classStartIndex`: Class start index
  - `icon?`: Icon path
  - `isNotable?`, `isMastery?`, `isKeystone?`, `isJewelSocket?`: Boolean flags
  - `expansionJewel?`: Expansion jewel data
  - `stats?`: Array of stat strings
  - `group?`: Group ID
  - `orbit?`, `orbitIndex?`: Orbit information
  - `out?`, `in?`: Connection arrays
  - `reminderText?`: Reminder text
  - `inactiveIcon?`: Inactive icon
  - `conqueredName?`: Conquered name
  - `timelessStats?`: Timeless stats
  - `timelessStatKeys?`, `timelessStatValues?`: Stat keys and values
  - `x`, `y`: Position coordinates

#### TreeData
- **Purpose**: Complete passive skill tree data
- **Fields**:
  - `tree`: Tree identifier
  - `groups`: Record of group data
  - `nodes`: Record of node data
  - `constants`: Tree constants (orbit radii, skills per orbit)
  - `min_x?`, `min_y?`, `max_x?`, `max_y?`: Bounds
  - `imageZoomLevels?`: Zoom levels
  - `sprites`: Sprite data
  - `socketNodes`: Socket node mappings

### Timeless Jewel Structures

#### JewelType
- **Purpose**: Timeless jewel type definition
- **Fields**:
  - `label`: Display label
  - `name`: Internal name
  - `id`: Type ID
  - `min`, `max`: Seed range

#### Conqueror
- **Purpose**: Timeless conqueror definition
- **Fields**:
  - `label`: Display label
  - `id`: Conqueror ID
  - `keystone`: Keystone name
  - `type`: Conqueror type

#### Stat
- **Purpose**: Jewel stat definition for search
- **Fields**:
  - `statKey`: Stat key ID
  - `label`: Display label
  - `weight`: Weight value
  - `minWeight`: Minimum weight

#### JewelEntry
- **Purpose**: Individual jewel data entry
- **Fields**:
  - `r`: Record of stat replacements
  - `a`: Record of stat alternatives

### Application State

#### SearchStore
- **Purpose**: Main application search state
- **Fields**:
  - `jewelType`: Selected jewel type
  - `conqueror`: Selected conqueror
  - `seed`: Selected seed
  - `selectedStats`: Array of selected stats
  - `searched`: Search flag
  - `statsResults`: Search results by conqueror
  - `minTotalWeight`: Minimum weight filter
  - `league`: Selected league
  - `platform`: Selected platform
  - `currentPage`: Pagination
  - `totalResults`: Total results count
  - `orderedSeeds`: Ordered seed array
  - `lastTradeInfo`: Last trade query info

### Supporting Types

#### League
- **Purpose**: PoE league information
- **Fields**:
  - `name`: League name
  - `start_date?`: Start date
  - `end_date?`: End date

#### Platform
- **Type**: Union type
- **Values**: "PC" | "Xbox" | "Playstation"

#### Translation
- **Purpose**: Stat translation mapping
- **Fields**:
  - `from`: Source value
  - `to`: Target value
  - `translation`: Translated text

#### Coords
- **Purpose**: Coordinate definition
- **Fields**:
  - `x`, `y`: Position
  - `w`, `h`: Dimensions

#### Sprite
- **Purpose**: Sprite sheet definition
- **Fields**:
  - `filename`: Sprite file
  - `w`, `h`: Dimensions
  - `coords`: Coordinate mappings

#### ExpansionJewel
- **Purpose**: Expansion jewel data
- **Fields**:
  - `size`: Size
  - `index`: Index
  - `proxy`: Proxy
  - `parent?`: Parent node
