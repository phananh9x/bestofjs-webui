import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Route, Switch } from 'react-router-dom'

import { useSelector } from 'containers/project-list-container'
import { findProjectById } from 'selectors'
import track from 'helpers/track'
import { useFetchProjectDetails } from 'api/hooks'

import { MainContent, Spinner } from 'components/core'
import ProjectDetails from 'components/project-details'
import { ProjectHeader } from 'components/project-details/project-header'

const ProjectDetailsPageContainer = () => {
  const { id } = useParams()

  const project = useSelector(findProjectById(id))
  // if the user loads directly the `/projects/:id` URL in the browser,
  // the project is not available yet in the Redux store
  return project ? <ProjectDetailsPage project={project} /> : <Spinner />
}

const ProjectDetailsPage = props => {
  const { project } = props

  const { data: details, isLoading, error } = useFetchProjectDetails(project)
  const projectWithDetails = getProjectWithDetails(project, details)

  useEffect(() => {
    if (project) {
      track('View project', project.name)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MainContent>
      <ProjectHeader {...props} project={projectWithDetails} />
      <Switch>
        <Route
          exact
          path="/projects/:id"
          render={() => (
            <ProjectDetails
              {...props}
              project={projectWithDetails}
              isLoading={isLoading}
              error={error}
            />
          )}
        />
      </Switch>
    </MainContent>
  )
}

function getProjectWithDetails(project, details) {
  if (!details) return project
  const {
    npm,
    bundle,
    packageSize,
    description,
    github: { contributor_count, commit_count, created_at },
    timeSeries
  } = details

  return {
    ...project,
    description,
    timeSeries,
    commit_count,
    contributor_count,
    created_at,
    npm,
    bundle,
    packageSize
  }
}

export default ProjectDetailsPageContainer